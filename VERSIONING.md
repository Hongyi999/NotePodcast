# Version Management Guide

## Current Version

**v0.1.0** - Initial Release (2024-12-19)

## Version Files

- `.version` - Simple version number file
- `package.json` - NPM package version
- `CHANGELOG.md` - Detailed changelog
- `VERSION.md` - Version history
- `RELEASE_NOTES_v0.1.0.md` - Release notes for v0.1.0
- Git tag: `v0.1.0`

## Version Control Commands

### View Current Version
```bash
cat .version
# or
grep '"version"' package.json
```

### View All Version Tags
```bash
git tag -l
```

### View Tag Details
```bash
git show v0.1.0
```

### Checkout a Specific Version
```bash
git checkout v0.1.0
```

### Create a Branch from a Version
```bash
git checkout -b feature-branch v0.1.0
```

### Compare Versions
```bash
git diff v0.1.0 HEAD  # Compare v0.1.0 with current
git diff v0.1.0 v0.2.0  # Compare two versions
```

### List Files in a Version
```bash
git ls-tree -r --name-only v0.1.0
```

## Creating a New Version

### Steps to Create v0.2.0 (Example)

1. **Update version numbers:**
   ```bash
   # Update .version file
   echo "0.2.0" > .version
   
   # Update package.json
   # (edit package.json and change version to "0.2.0")
   ```

2. **Update CHANGELOG.md:**
   - Add new section for v0.2.0
   - Document all changes

3. **Commit changes:**
   ```bash
   git add -A
   git commit -m "Prepare release v0.2.0"
   ```

4. **Create version tag:**
   ```bash
   git tag -a v0.2.0 -m "Version 0.2.0: [Description of changes]"
   ```

5. **Push to remote (if applicable):**
   ```bash
   git push origin main
   git push origin v0.2.0
   ```

## Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR.MINOR.PATCH** (e.g., 0.1.0)
  - **MAJOR**: Breaking changes
  - **MINOR**: New features (backward compatible)
  - **PATCH**: Bug fixes (backward compatible)

### Current Version Scheme
- Starting with **0.1.0** (initial release)
- Pre-1.0.0 versions are considered development/beta

## Backup and Archive

### Create Archive of Current Version
```bash
# Create a tarball of the current version
git archive --format=tar.gz --prefix=notepodcast-v0.1.0/ v0.1.0 > notepodcast-v0.1.0.tar.gz

# Or create a zip file
git archive --format=zip --prefix=notepodcast-v0.1.0/ v0.1.0 > notepodcast-v0.1.0.zip
```

### Export Version to Directory
```bash
mkdir -p releases/v0.1.0
git archive v0.1.0 | tar -x -C releases/v0.1.0
```

## Version History

See [VERSION.md](./VERSION.md) for detailed version history.

## Quick Reference

| Action | Command |
|--------|---------|
| View current version | `cat .version` |
| List all tags | `git tag -l` |
| Checkout version | `git checkout v0.1.0` |
| View tag info | `git show v0.1.0` |
| Create tag | `git tag -a v0.1.0 -m "message"` |
| Delete tag (local) | `git tag -d v0.1.0` |
| Create archive | `git archive v0.1.0 > v0.1.0.tar.gz` |

