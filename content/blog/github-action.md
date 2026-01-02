---
pid: 1
title: An article teaches you how to use Github Actions to achieve website auto deploy
date: 2025-09-10T14:16:03+08:00
sort: maintenance
---

Previously, I always used vercel to host websites. After writing the code, I just needed to submit it to github, and vercel would update it automatically, so I didn't have to worry about anything else

But recently I wrote a website for a minecraft server. If vercel is used for hosting, it will cause some players in the Chinese mainland to be unable to view it. Therefore, we specially purchased a domestic vps deployment website

However, due to the configuration of the vps being 2c1.5g, the website uses nuxt ui4, which is a large component library that is not imported on demand. As a result, the vps memory is too low to build the website.

so I would build the website on my own computer and then push the `.output` folder to GitHub. The server would simply pull the code down and run it.

However, I encountered another problem. The vps always times out when pulling code from github. There's no choice. I can only to manually build the website on my own computer and then move the complete content to the server using a software.

But this is too troublesome. If I have to fix bugs or add new content every now and then, I have to deploy it manually, which is very tiring.

However, I remembered that GitHub had a feature called Actions that could help me build the website and then push the complete content to the server.

---

Tip: Since this article was written while exploring the workflow, there may be some errors. Please refer to the annotations for accuracy and do not blindly cv.

---

Here, we take a blank nuxt project as an example. To facilitate the configuration of environment variables, we will also add the '.env 'file.

## Configure vps

We need to first create a pair of openSSH format keys on our own computer for communication between the GitHub container and our VPS later.

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

After executing the above command, it will ask you where to place the file. Here, I put it on the desktop, that is, input`C:\Users\aliceclodia\Desktop\authorized_keys.key`

Attention! Here, you need to enter the name of the saved file; otherwise, an error will be reported.

Then comes the password. The password is optional. If you don't want it, just press Enter.

After successful saving, there will be two files on the desktop: `authorized_keys.key` & `authorized_keys.key.pub`

We need to upload `authorized_keys.key.pub` to the `~/.ssh/` directory of our VPS. And remember to remove the `.key.pub` suffix.

If the `~/.ssh/` directory does not exist, just create it.

This completes the configuration of the VPS.

## Configure Repository secrets

Now, let's upload the blank project to GitHub. Then, go to the project's repo -> settings -> Security -> secrets and variables -> Actions

Configure Repository secrets, which is essentially repository environment variables. You can think of them as environment variables.

![1](https://image.s22y.moe/image/github_action/2.webp)

There are three required ones, although you may need to adjust them based on your workflow.

- SSH_HOST: Server address
- SSH_PRIVATE_KEY: The `.key` file content of the generated key pair. Copy the content directly here.
- SSH_USER: The username used to log in to the VPS. This username depends on which user's `~/.ssh/` directory the `.pub` file is placed in.

Since we also need to add environment variables, we need to add `ENV`. Simply copy the content of `.env` into this field.

## Create a workflow

Jump to repo -> Actions, choose a template based on your needs, or click `set up a workflow yourself` to create a new one.

Although there is a `NuxtJS` template, but I still prefer to write a new one.

So, click `set up a workflow yourself`.

First, configure the basic information.

```yaml
# Workflow name
name: Build and Deploy

# Trigger the workflow on push to the main branch
on:
    push:
        branches:
            - main
```

Then, it's time for the actual jobs.

```yaml
jobs:
    build:
        # The container used by the job
        runs-on: ubuntu-latest
        # job 's name
        name: build

        # job 's steps
        steps:
            # Take the repo code into the container
            - name: Checkout code
              uses: actions/checkout@v4

            # set node and pnpm package manager
            - name: Set up Node.js and pnpm
              uses: pnpm/action-setup@v4

            # add env variables
            # because I'm using nuxt, nuxt will inject env variables when build, so I need to add env in container
            - name: set env
              run: |
                  echo '${{ secrets.ENV }}' > /home/runner/work/orange/orange/.env

            # install dependencies and build
            - name: Install dependencies and build
              run: |
                  pnpm install --frozen-lockfile
                  pnpm run build --if-present

            # set up ssh
            - name: Set up SSH
              run: |
                  mkdir -p ~/.ssh
                  echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
                  chmod 600 ~/.ssh/id_rsa
                  ssh-keyscan -H ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
              env:
                  SSH_HOST: ${{ secrets.SSH_HOST }}

            # upload build to server
            - name: Upload build to server
              # The directory in the front section here is the location where the generated file is after build. This directory can be found through the log during the previous build.
              # The directory at the back section represents which directory you want to upload to the server.
              # This command will push all the files in the root directory of the entire project to /home/alalice /actions in the server directory instead of uploading the project file 'actions' to the server.
              run: |
                  rsync -avz /home/runner/work/actions/actions/ ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/home/${{ secrets.SSH_USER }}/actions
              env:
                  SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

Attention! If your vps has modified the port, you need to modify the command

```yaml
- name: Set up SSH
  run: |
      mkdir -p ~/.ssh
      echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
      chmod 600 ~/.ssh/id_rsa
      ssh-keyscan -H -p ${{ secrets.SSH_PORT }} ${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts
  env:
      SSH_HOST: ${{ secrets.SSH_HOST }}

# upload build to server
- name: Upload build to server
  # The directory in the front section here is the location where the generated file is after build. This directory can be found through the log during the previous build.
  # The directory at the back section represents which directory you want to upload to the server.
  # This command will push all the files in the root directory of the entire project to /home/alalice /actions in the server directory instead of uploading the project file 'actions' to the server.
  run: |
      rsync -avz -e "ssh -p ${{ secrets.SSH_PORT }}" /home/runner/work/actions/actions ${{ secrets.SSH_USER }}@${{ secrets.SSH_HOST }}:/home/${{ secrets.SSH_USER }}
  env:
      SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
```

Now we can start writing the deployment part. I have already transferred the generated file to the vps earlier.

```yaml
deploy:
    runs-on: ubuntu-latest
    name: deploy
    # This is mandatory, indicating that this step must complete the build job
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

        # Here are the commands to install dependencies and deploy the project. You need to modify them according to your project.
        # For example, I am using pnpm + pm2 here.
        # Attention! Because the action's ssh is non-interactive, you need to add parameters according to the situation, such as pnpm's --prefer-frozen-lockfile, otherwise there will be problems.
        # Attention! The ssh of action does not load user scripts, so it does not know your software, such as the installation directory of node pnpm. Therefore, you need to load it manually or execute it directly with the complete directory
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

Now the actions workflow is ready. When GitHub detects that the files in the `.github/workflows/` directory have changed, it will automatically execute the actions.

Now you don't need to do anything else. You can focus on writing code instead of manually pushing the project to the server.

![actions](https://image.s22y.moe/image/github_action/1.webp)

Below are all the errors I encountered, and it took me a morning to figure out the correct way.
