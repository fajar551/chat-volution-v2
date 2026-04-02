# Contribution

- [Git](#git)
    - [Branching](#branching)
    - [Pull, Push, dan Merging](#updating-branch)
- [Deploy](#deploy)
    - [Staging](#staging-server)
    - [Live](#live-server)

Bagian ini menjelaskan aturan-aturan teknis yang perlu diimplementasikan ketika developer berkontribusi pada project ChatVolution.

---

<a name="git"></a>
## Git

Source code aplikasi disimpan di GitLab yang dapat diakses melalui link berikut <a href="http://gitserver2.qwords.net">gitserver2.qwords.net</a>. Lalu, clone project dan jalankan proses instalasi (lihat <a href="/{{route}}/{{version}}/get-started/installation">Installation</a>).

<a name="branching"></a>
### Branching
Default:
- `dev` digunakan untuk proses development
- `master` hanya digunakan untuk production (live)
>{warning} Setelah berhasil clone project, diwajibkan untuk checkout ke branch `dev` dengan menggunakan perintah `git checkout dev`.


<a name="updating-branch"></a>
### Pull, Push, dan Merging
- Pull
<br>Lakukan perintah `git pull origin dev` untuk mengupdate local branch.

- Push
<br>Lakukan perintah `git push origin dev` untuk mengupdate remote repository. Harap lakukan `pull` terlebih dahulu setiap sebelum melakukan `push`. Jika terjadi conflict maka solve conflict di local terlebih dahulu, atau hubungi koordinator project.

- Merging
<br>Proses merging dapat dilakukan pada GitLab server menggunakan fitur merge request (MR). Atau hubungi koordinator project untuk melakukan merge ke master.


---


<a name="deploy"></a>
## Deploy

<a name="staging-server"></a>
### Staging

Untuk deploy ke server staging dapat dilakukan langkah-langkah sebagai berikut:

```bash
...
git commit -m "commit message"

git remote add deploydev ssh://chatvolutionmy@103.28.12.57/home/chatvolutionmy/staging-live-chat    #Add remote
git pull deploydev dev                                                                              #Pull branch
git push deploydev dev                                                                              #Push branch
```
>{warning} Pastikan local branch `dev` telah terupdate dengan remote branch `dev`. Hal ini dapat dilakukan dengan melakukkan perintah `git pull origin dev`


<a name="live-server"></a>
### Live

#### Prerequisite
- Pastikan local branch `master` telah terupdate remote branch
- Merge local branch `dev` dengan branch `master`
- Jika terjadi conflict, solve conflict tersebut di branch `dev`
- Push local branch `dev` ke git server
- Lakukan `merge request` melalui GitLab dari branch `dev` ke branch `master`

Untuk deploy ke server staging dapat dilakukan langkah-langkah sebagai berikut:

```bash
...
git checkout master

git remote add deploylive ssh://chatvolutionmy@chatvolution.my.id/home/chatvolutionmy/live-chat         #Add remote
git pull deploylive master                                                                              #Pull branch
git push deploylive master                                                                              #Push branch
```

