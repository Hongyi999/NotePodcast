import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

const app = express();
app.use(cors());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/youtube/info', async (req, res) => {
  const url = String(req.query.url || '');
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const info = await ytdl.getInfo(url);
    const details = info.videoDetails;
    return res.json({
      title: details?.title || '',
      description: details?.shortDescription || '',
      durationSeconds: Number(details?.lengthSeconds || 0),
      author: details?.author?.name || '',
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to get YouTube info';
    return res.status(500).json({ error: message });
  }
});

function parseRangeHeader(rangeHeader, totalSize) {
  // rangeHeader: "bytes=start-end"
  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) return null;
  const [startStr, endStr] = rangeHeader.replace('bytes=', '').split('-');
  const start = startStr ? Number(startStr) : 0;
  const end = endStr ? Number(endStr) : totalSize - 1;
  if (Number.isNaN(start) || Number.isNaN(end) || start > end) return null;
  return { start, end };
}

app.get('/api/youtube/audio', async (req, res) => {
  const url = String(req.query.url || '');
  if (!url) return res.status(400).send('Missing url');

  try {
    const info = await ytdl.getInfo(url);
    // Prefer Safari-friendly m4a when available, otherwise fallback to any audio-only
    const m4a = info.formats.find(
      (f) =>
        f.hasAudio &&
        !f.hasVideo &&
        typeof f.mimeType === 'string' &&
        f.mimeType.includes('audio/mp4')
    );
    const format = m4a || ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

    const mimeType = (format.mimeType || 'audio/webm').split(';')[0];
    const totalSize = format.contentLength ? Number(format.contentLength) : null;
    const range = totalSize ? parseRangeHeader(req.headers.range, totalSize) : null;

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Accept-Ranges', 'bytes');

    if (totalSize && range) {
      const chunkSize = range.end - range.start + 1;
      res.status(206);
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${totalSize}`);
      res.setHeader('Content-Length', String(chunkSize));

      const stream = ytdl.downloadFromInfo(info, {
        format,
        range: { start: range.start, end: range.end },
        highWaterMark: 1 << 25,
      });
      stream.on('error', () => res.destroy());
      stream.pipe(res);
      return;
    }

    if (totalSize) res.setHeader('Content-Length', String(totalSize));

    const stream = ytdl.downloadFromInfo(info, {
      format,
      highWaterMark: 1 << 25,
    });
    stream.on('error', () => res.destroy());
    stream.pipe(res);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to stream YouTube audio';
    res.status(500).send(message);
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[notepodcast] youtube backend listening on http://localhost:${PORT}`);
});


