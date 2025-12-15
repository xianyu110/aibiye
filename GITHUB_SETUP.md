# GitHub 上传指南

## 前置准备

1. **确保已安装 Git**
   ```bash
   git --version
   ```

2. **配置 Git（如果还没配置）**
   ```bash
   git config --global user.name "你的名字"
   git config --global user.email "你的邮箱"
   ```

3. **在 GitHub 创建新仓库**
   - 访问 https://github.com/new
   - 输入仓库名称（例如：ai-text-paraphraser）
   - 选择 Public 或 Private
   - **不要**勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

## 上传步骤

### 1. 初始化 Git 仓库

```bash
# 如果还没有初始化 Git
git init

# 添加所有文件
git add .

# 创建第一次提交
git commit -m "Initial commit: AI Text Paraphrasing Tool"
```

### 2. 连接到 GitHub 仓库

```bash
# 设置主分支名称为 main
git branch -M main

# 添加远程仓库（替换为你的 GitHub 用户名和仓库名）
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送代码到 GitHub
git push -u origin main
```

### 3. 验证上传

访问你的 GitHub 仓库页面，确认文件已成功上传。

## 后续更新

当你修改代码后，使用以下命令更新：

```bash
# 查看修改的文件
git status

# 添加修改的文件
git add .

# 提交修改
git commit -m "描述你的修改"

# 推送到 GitHub
git push
```

## 常见问题

### 问题 1: 推送被拒绝

如果遇到 "Updates were rejected" 错误：

```bash
# 先拉取远程更改
git pull origin main --rebase

# 再推送
git push origin main
```

### 问题 2: 认证失败

GitHub 已不支持密码认证，需要使用 Personal Access Token：

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 选择权限：至少勾选 `repo`
4. 生成并复制 token
5. 推送时使用 token 作为密码

或者使用 SSH：

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "你的邮箱"

# 添加到 ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# 复制公钥
cat ~/.ssh/id_ed25519.pub

# 在 GitHub Settings > SSH Keys 中添加公钥

# 修改远程仓库地址为 SSH
git remote set-url origin git@github.com:你的用户名/你的仓库名.git
```

### 问题 3: 文件太大

如果有大文件无法推送：

```bash
# 查看大文件
find . -type f -size +50M

# 将大文件添加到 .gitignore
echo "大文件路径" >> .gitignore

# 如果已经提交，需要从历史中移除
git rm --cached 大文件路径
git commit -m "Remove large file"
```

## 下一步：部署到 Vercel

上传到 GitHub 后，参考 [DEPLOYMENT.md](./DEPLOYMENT.md) 进行 Vercel 部署。
