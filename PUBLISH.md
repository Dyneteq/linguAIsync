# Publishing Guide

## Pre-publish Checklist

1. ✅ Code is functional and tested
2. ✅ README is up to date
3. ✅ package.json has correct details
4. ✅ License file exists
5. ✅ .npmignore excludes unnecessary files
6. ✅ Version number is correct

## Steps to Publish

### 1. Verify Package Contents

```bash
npm pack --dry-run
```

This shows what will be included in the package. Should see:
- bin/
- lib/
- LICENSE
- README.md
- package.json

### 2. Test Locally

```bash
# Create tarball
npm pack

# Test in another directory
cd /tmp
npm install /path/to/linguaisync-1.0.0.tgz
linguaisync --help

# Clean up
npm uninstall linguaisync
```

### 3. Login to npm

```bash
npm login
```

Enter your npm credentials.

### 4. Publish to npm

**First time / Public package:**

```bash
npm publish
```

**If using scoped package (@username/package):**

```bash
npm publish --access public
```

### 5. Verify Publication

```bash
# Check on npm
npm view linguaisync

# Install from npm
npm install -g linguaisync
linguaisync --help
```

## Version Management

### Update Version

```bash
# Patch: 1.0.0 -> 1.0.1
npm version patch

# Minor: 1.0.0 -> 1.1.0
npm version minor

# Major: 1.0.0 -> 2.0.0
npm version major
```

### Publish New Version

```bash
npm version patch
npm publish
git push && git push --tags
```

## Common Issues

### "Package name already exists"

Choose a different package name in package.json:
```json
{
  "name": "your-unique-name"
}
```

### "You must be logged in"

```bash
npm login
```

### "You do not have permission"

For scoped packages (@username/package), add:
```bash
npm publish --access public
```

## After Publishing

1. Update repository URL in package.json
2. Add GitHub repository
3. Update homepage URL
4. Tag the release in git

```bash
git tag v1.0.0
git push origin v1.0.0
```
