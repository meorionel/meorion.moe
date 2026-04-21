---
title: 一篇文章教你如何使用Github Actions实现网站自动化部署
pubDate: 2025-09-10T14:16:03+08:00
---

原本我一直都是用vercel做托管, 写完代码我只需要把代码推上GitHub, 之后的事情就不需要我操心了.

但是前两天给服务器写了个网站, 如果用vercel做托管, 会导致大陆的部分玩家没法查看, 所以我们特地买了个国内的vps做了备案.

但是问题是vps的配置是2c1.5g, 网站用了nuxt ui4, 这个组件库太大了, 又没有按需导入, vps内存低没法build.

之前我是在自己的电脑上build之后直接把`.output`推到GitHub上, 服务器只要拉下来就可以跑了.

但是又遇到了问题, 这个国内的vps它拉取代码总是超时, 我就只能自己在本地build之后用软件手动挪到服务器上, 然后又手动重新部署.

这上面的步骤光是说出来都力竭了, 如果隔三岔五就要改bug, 加内容, 就很累.

我想起Github有个Actions的功能可以做自动化, 就研究了一下能不能实现GitHub帮我build, 然后把完整的内容直接推到服务器上, 这样我就不用把`.output`放到repo了.

---

前排提示 因为这篇文章是一边写工作流一边试错一边写的, 所以可能会存在一些错误, 请以注释为准, 不要盲目cv.

---

这里用一个nuxt的空白项目作为例子, 为了方便配置环境变量, 我们还会添加 `.env` 文件.

## 配置 vps

我们需要先在自己的电脑上创建一对 openSSH 格式的密钥, 用于之后 GitHub 容器和我们的VPS通讯.

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

他会问你文件要放在哪, 这里我放在桌面, 也就是输入`C:\Users\${{ secrets.SSH_USER }}\Desktop\authorized_keys.key`

注意! 这里要输入保存的文件的名字, 否则会报错.

然后就是密码, 密码是可选的, 不想要密码直接回车就好了.

保存成功后桌面会有两个文件: `authorized_keys.key` & `authorized_keys.key.pub`

我们需要将 `authorized_keys.key.pub` 上传到 vps 的 `~/.ssh/`, 并且要去掉 `.key.pub`.

如果 `~/.ssh/` 目录不存在就创建一下就好了.

这样 vps 的配置就完成了

## 配置 Repository secrets

现在先把空白项目上传到GitHub, 进入项目的repo -> settings -> Security -> secrets and variables -> Actions

配置 Repository secrets, 这个东西就相当于是仓库的环境变量, 你就当环境变量去配置就好了.

![1](https://image.meorion.moe/image/github_action/2.webp)

这里有三个必填的, 当然, 根据你工作流的不同需要进行调整.

- SSH_HOST: 服务器地址
- SSH_PRIVATE_KEY: 刚刚生成的密钥的`.key`, 直接复制内容到这里.
- SSH_USER: 登录的用户名, 这个用户名取决你前面的`.pub`放在哪个用户的`~/.ssh/`中.

因为我们还需要添加环境变量, 所以需要添加 `ENV`, 直接将 `.env` 的内容复制进去就好了.

## 创建工作流

跳转到 repo -> Actions, 根据你的需要选择一个模板, 或者直接点击 `set up a workflow yourself` 创建一个新模板.

这里虽然有 `NuxtJS` 的模板, 但是我还是喜欢写一个新的.

所以直接点击 `set up a workflow yourself`.

先配置基础的信息.

```yaml
# 工作流的名字
name: Build and Deploy

# 使用哪一个分支的代码
on:
    push:
        branches:
            - main
```

然后就是具体的 jobs.

```yaml
jobs:
    # 这里是构建 job
    build:
        # job 使用的容器环境
        runs-on: ubuntu-latest
        # job 的名字
        name: build

        # job 的步骤
        steps:
            # 将 repo 的代码拿到容器中
            - name: Checkout code
              uses: actions/checkout@v4

            # 设置 node 环境和 pnpm 包管理器
            - name: Set up Node.js and pnpm
              uses: pnpm/action-setup@v4

            # 添加环境变量
            # 因为我这里使用的是nuxt nuxt会在build时注入环境变量, 所以需要在容器内添加env
            - name: set env
              run: |
                  echo '${{ secrets.ENV }}' > /home/runner/work/orange/orange/.env

            # 安装依赖和 build
            - name: Install dependencies and build
              run: |
                  pnpm install --frozen-lockfile
                  pnpm run build --if-present

            # 设置 SSH
            - name: Set up SSH
              run: |
                  mkdir -p ~/.ssh
                  echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
                  chmod 600 ~/.ssh/id_rsa
                  ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
              env:
                  SSH_HOST: ${{ secrets.SSH_HOST }}

            # 传输构建完成的产物
            - name: Upload build to server
              # 这里的前面一截的目录是 build 之后生成文件所在的位置, 这个目录可以通过前面 build 时的日志查找到.
              # 后面一截的目录就是代表你要上传到服务器的哪个目录.
              # 这条命令会把整个项目根目录的文件全部推送到服务器目录的 /home/alice/actions 中, 而不是把项目文件`actions`上传到服务器.
              run: |
                  rsync -avz /home/runner/work/actions/actions/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/home/${{ secrets.SSH_USER }}/actions
              env:
                  SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

注意! 如果你的 vps 修改了端口, 就需要修改一下指令:

```yaml
- name: Set up SSH
  run: |
      mkdir -p ~/.ssh
      echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
      chmod 600 ~/.ssh/id_rsa
      ssh-keyscan -H -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
  env:
      SSH_HOST: ${{ secrets.SSH_HOST }}

# 推送文件到服务器
- name: Upload build to server
  # 这里的前面一截的目录是action build之后生成文件所在的位置, 这个目录可以通过前面build时的日志查找到.
  # 后面一截的目录就是代表你要上传到服务器的哪个目录.
  # 这条命令会把整个项目根目录的文件全部推送到服务器目录的/home/alice/orange中, 而不是把项目文件`orange`上传到服务器.
  run: |
      rsync -avz -e "ssh -p ${{ secrets.SSH_PORT }}" /home/runner/work/actions/actions ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/home/${{ secrets.SSH_USER }}
  env:
      SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

现在我们可以来写部署的部分了, 前面我已经把生成的文件传输到 vps 上了.

```yaml
deploy:
    runs-on: ubuntu-latest
    name: deploy
    # 这个是必须的, 代表这一步必须要执行完build job
    needs: build

    steps:
        - name: Set up SSH
          run: |
              mkdir -p ~/.ssh
              echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
              chmod 600 ~/.ssh/id_rsa
              ssh-keyscan -H -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
          env:
              SSH_HOST: ${{ secrets.SSH_HOST }}

        # 这里执行的就是依赖安装和部署了, 需要根据你的项目进行修改.
        # 比如我这里使用的是pnpm + pm2.
        # 注意! 因为action的ssh是非交互的, 所以你的指令需要根据情况添加参数, 例如 pnpm 的 --prefer-frozen-lockfile, 否则会出现问题.
        # 注意! action的ssh不会加载用户脚本, 所以他并不知道你的软件, 例如node pnpm的安装目录, 所以你需要手动加载, 或者直接用完整的目录去执行
        - name: deploy on server
          run: |
              ssh -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }} << 'ENDSSH'

              export PATH="/home/${{ secrets.SSH_USER }}/.nvm/versions/node/v24.6.0/bin:$PATH"

              cd /home/${{ secrets.SSH_USER }}/actions

              # 判断进程是否存在
              if ! /home/${{ secrets.SSH_USER }}/.local/share/pnpm/pm2 list | grep -q 'actions'; then
                echo "🟢 'actions' 服务未运行，正在启动..."
                /home/${{ secrets.SSH_USER }}/.local/share/pnpm/pm2 start ecosystem.config.cjs --env .env
              else
                echo "🟡 'actions' 服务已在运行，正在重启..."
                /home/${{ secrets.SSH_USER }}/.local/share/pnpm/pm2 restart actions
              fi

              ENDSSH
          env:
              SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

现在actions的工作流写好了, 当GitHub检测到`.github/workflows/`目录下的文件有变动时就会自动执行actions.

现在你已经不需要再做什么其他的工作了, 这样你就能全身心投入到代码的编写中而不是手动推送部署项目了.

![actions](https://image.meorion.moe/image/github_action/1.webp)

下面的报错全是泪, 跟GPT拉扯了一个早上才摸索出正确的做法.
