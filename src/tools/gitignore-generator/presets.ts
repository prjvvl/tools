/**
 * Static, hand-written .gitignore content per preset (no network fetch).
 * Each preset's `body` is the rule list only; the "### <Name> ###" section
 * header is added by the component when composing output.
 */
export interface GitignorePreset {
  id: string;
  label: string;
  body: string;
}

export const PRESETS: GitignorePreset[] = [
  {
    id: "node",
    label: "Node",
    body: `node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-store/
.npm/
.yarn/cache
.yarn/unplugged
.yarn/build-state.yml
.yarn/install-state.gz
dist/
build/
coverage/
.env
.env.local
.env.*.local
*.tsbuildinfo`,
  },
  {
    id: "python",
    label: "Python",
    body: `__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.venv/
venv/
env/
ENV/
.mypy_cache/
.pytest_cache/
.ruff_cache/
.tox/
.coverage
.coverage.*
htmlcov/
*.log`,
  },
  {
    id: "java",
    label: "Java",
    body: `*.class
*.jar
*.war
*.ear
*.nar
hs_err_pid*
replay_pid*
target/
.mvn/timing.properties
.mvn/wrapper/maven-wrapper.jar
build/
!gradle/wrapper/gradle-wrapper.jar
.gradle/`,
  },
  {
    id: "go",
    label: "Go",
    body: `*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
go.work
go.work.sum
vendor/
/bin/`,
  },
  {
    id: "rust",
    label: "Rust",
    body: `/target/
**/*.rs.bk
Cargo.lock
*.pdb`,
  },
  {
    id: "macos",
    label: "macOS",
    body: `.DS_Store
.AppleDouble
.LSOverride
Icon
._*
.DocumentRevisions-V100
.fseventsd
.Spotlight-V100
.TemporaryItems
.Trashes
.VolumeIcon.icns
.com.apple.timemachine.donotpresent
.AppleDB
.AppleDesktop
Network Trash Folder
Temporary Items
.apdisk`,
  },
  {
    id: "windows",
    label: "Windows",
    body: `Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
*.stackdump
Desktop.ini
$RECYCLE.BIN/
*.cab
*.msi
*.msix
*.msm
*.msp
*.lnk`,
  },
  {
    id: "linux",
    label: "Linux",
    body: `*~
.fuse_hidden*
.directory
.Trash-*
.nfs*`,
  },
  {
    id: "vscode",
    label: "VSCode",
    body: `.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
!.vscode/*.code-snippets
.history/
*.vsix`,
  },
  {
    id: "intellij",
    label: "IntelliJ",
    body: `.idea/
*.iml
*.iws
*.ipr
out/
.idea_modules/
cmake-build-*/
atlassian-ide-plugin.xml`,
  },
  {
    id: "env",
    label: ".env",
    body: `.env
.env.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
*.env`,
  },
  {
    id: "docker",
    label: "Docker",
    body: `*.pid
docker-compose.override.yml
.docker/
volumes/`,
  },
];
