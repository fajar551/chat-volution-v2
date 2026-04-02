# Internal Chat

- [Features](#features)
    - [Create Chat Room (New Chat)](#create-room-new-chat)
    - [Show List Chat](#show-list-chat)
    - [Show Chat Detail](#show-chat-detail)
    - [Reply Chat](#reply-chat)
    - [Upload File](#upload-file)
    - [Delete Conversation](#delete-conversation)
    - [Push Notification](#push-notification)
    - [Pin & Unpin Message](#pin-message)
    - [List Pinned Message](#list-pinned-message)
    - [Search Message](#search-message)
- [Private Chat](#private-chat)
    <!-- - [Reply Private Chat](#reply-private-chat) -->
- [Group Chat](#group-chat)
    <!-- - [Create Group](#create-group)
    - [Show Group Detail](#show-group-detail)
    - [Delete Group](#delete-group)
    - [Update Group](#update-group)
    - [Group Member](#group-member)
    - [Group Notification](#group-notification) -->

Fitur chatting yang dapat digunakan oleh agent dalam 1 perusahaan. Chat secara personal, buat grup, tarik pesan, pin chat, dan fitur internal chat lainnya.

---

<a name="features"></a>
## Features

Terdapat kesamaan routes/method pada fitur-fitur yang digunakan baik di `private chat` maupun `group chat`. Perbedaan routes, method, payload, response, dan lainnya dipisahkan pada sub bab selanjutnya.

<a name="create-room-new-chat"></a>
## Create Chat Room (New Chat)

Baik itu private chat maupun group chat, keduanya bekerja di dalam sebuah room chat. Sebelum agent dapat bertukar pesan ke agent lain/group, agent perlu melakukan action `membuat chat baru`. Chat room tidak otomatis terbentuk pada private chat. Berbeda ketika membuat grup baru, chat room akan otomatis terbentuk dan muncul pada list chat.

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/new-{type}

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - newChat()
- app\Services\InternalChatService
    - storeFirstChat()
    - storeFirstChatToGroup()
```

|   Query/Parameter Name       |   Value                          |   Deskripsi           |
|   :-                         |   :-                             |   :-                  |
|   Authorization              |   Bearer token                   |   Request Headers     |
|   Content-Type               |   application/json               |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest                 |   Request Headers     |
|   type                       |   `private-chat`, `group-chat`   |   Tipe chat           |

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   receiver                   |    Integer           |   ID agent yang dituju. Agent yang akan menerima pesan.    |

<br>

#### Response
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   code                       |   HTTP Response Code   |   Response code yang diberikan. Biasanya bernilai `200` jika respons sukses dan `4xx` untuk error respons   |
|   status                     |   String             |   Response hasil request dalam bentuk teks. Contoh: Sukses, Gagal, Error  |
|   message                    |   String             |   Pesan yang diberikan pada hasil request  |
|   data                       |                      |   Data yang diperoleh dari request yang dikirim  |



<a name="show-list-chat"></a>
## Show List Chat

Menampilkan list percakapan. API di bawah digunakan untuk menampilkan private chat dan group chat.

### Resources:
```php
# URL

# routes/web.php

# Class

# Views

```

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/list-{type}-chat

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - listChat()
- app\Services\InternalChatService
    - listChat()
    - listChatGroup()
    - showBubbleChatByChatId()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |
|   type                       |   `private`, `group`   |   Tipe chat yang ingin ditampilkan, terdiri dari: <br>- `private` privat (personal) <br>- `private` percakapan grup    |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   keyword                    |    String            |   (Opsional) Berfungsi untuk memfilter data berdasarkan: <br>- nama agent <br>- email agent <br>- nomor telepon agent   |
|   agent_name                 |    String            |   (Opsional) Berfungsi untuk memfilter data berdasarkan nama agent  |
|   agent_email                |    String            |   (Opsional) Berfungsi untuk memfilter data berdasarkan email agent |

<br>

#### Response
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   code                       |   HTTP Response Code   |   Response code yang diberikan. Biasanya bernilai `200` jika respons sukses dan `4xx` untuk error respons   |
|   status                     |   String             |   Response hasil request dalam bentuk teks. Contoh: Sukses, Gagal, Error  |
|   message                    |   String             |   Pesan yang diberikan pada hasil request  |
|   data                       |                      |   Data yang diperoleh dari request yang dikirim  |



<a name="show-chat-detail"></a>
## Show Chat Detail

Menampilkan detail percakapan yang berisi pesan-pesan (bubble chat) dari pengirim dan penerima chat. API yang digunakan berlaku untuk private chat maupun group chat.

### Resources:
```php
# URL

# routes/web.php

# Class

# Views

```

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/chat-details

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - showBubbleChatByChatId()
- app\Services\InternalChatService
    - showBubbleChatByChatId()
    - countUnreadChatByID()
- app\Services\PollService
    - getInstance()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   chat_id                    |    String            |   Chat ID. Contoh: QD6H9CX78SS   |
|   set_per_page               |    Integer           |   (Opsional) Pagination untuk menampilkan jumlah bubble chat. Default value yaitu `20`  |
|   reply_id                   |    Integer           |   ID bubble chat (chat reply). Contoh: 908   |



<a name="reply-chat"></a>
## Reply Chat

Membalas chat dalam suatu percakapan. Dapat juga dikatakan sebagai action mengirimkan bubble chat ke dalam suatu chat room.
<br>
- <a href="#reply-private-chat">Private Chat</a>
- <a href="r#eply-private-chat">Group Chat</a>



<a name="upload-file"></a>
## Upload File

API digunakan untuk mengupload file yang akan dikirim ke server. Response hasil upload file kemudian dapat digunakan untuk mengirimkan pesan.

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/upload-file

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - uploadFileInternalChat()
- app\Services\InternalChatService
    - uploadFileInternalChat()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   files                      |    File              |   File yang akan diupload. Untuk saat ini hanya dapat upload 1 file/request.   |



<a name="delete-conversation"></a>
## Delete Conversation

API digunakan untuk menghapus percakapan yang ada list chat, sehingga percakapan tidak akan muncul di dalam list chat. API akan menghapus bubble chat yang ada sehingga ketika agent melihat chat detail, room chat akan kosong.

- API dapat digunakan untuk menghapus private chat dan group chat
- Fitur ini tidak menghapus percakapan dan akan tetap tampil di list chat milik lawan bicara
- Percakapan grup akan tetap tampil pada list chat seusai sukses menghapus percakapan grup (group chat)

>{info} Percakapan tidak benar-benar terhapus, melainkan ada kondisi ketika bubble chat ditampilkan.

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/delete-conversation

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - deleteConversation()
- app\Services\InternalChatService
    - deleteConversation()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   chat_id                    |    String            |   Chat ID. Contoh: QD6H9CX78SS   |



<a name="delete-message"></a>
## Delete Message (Bubble Chat)

API digunakan untuk menghapus bubble chat dalam sebuah percakapan. Bubble chat ditampilkan menggunakan API Show Chat Detail.

- API dapat digunakan untuk menghapus bubble chat di private chat dan group chat
- Fitur ini tidak menghapus bubble chat dan akan menampilkan mengganti teks pada bubble chat bahwa pesan telah dihapus

> {info} Lihat: <a href="#show-chat-detail">Show Chat Detail</a>

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/delete-chat-reply

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - deleteBubbleChat()
- app\Services\InternalChatService
    - deleteBubbleChat()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   chat_id                    |    String            |   Chat ID. Contoh: QD6H9CX78SS   |
|   reply_id                   |    Integer           |   ID bubble chat (chat reply). Contoh: 908   |

> {info} Bubble chat tidak benar-benar terhapus, melainkan ada kondisi ketika bubble chat ditampilkan.



<a name="pin-message"></a>
## Pin & Unpin Message

Menambatkan (pin) pesan di chat room. Dapat digunakan di private chat maupun group chat.

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/{type}

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - updatePinBubbleChat()
- App\Services\InternalChatService
    - updatePinBubbleChat()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |
|   type                       |   `pin-message | unpin-message`     |   Tipe request     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi                      |
|   :-                         |   :-                 |   :-                             |
|   :-                         |   :-                 |   :-                             |
|   chat_id                    |    String            |   Chat ID. Contoh: QD6H9CX78SS   |
|   reply_id                   |    Integer           |   ID bubble chat (chat reply). Contoh: 908   |



<a name="list-pinned-message"></a>
## List Pinned Message

Menampilkan list pesan yang sudah di-pin pada sebuah chat room.

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/list-{type}

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - listChat()
- App\Services\InternalChatService
    - showBubbleChatByChatId()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |
|   type                       |   `pinned-message`   |   Tipe request        |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi                      |
|   :-                         |   :-                 |   :-                             |
|   :-                         |   :-                 |   :-                             |
|   chat_id                    |    String            |   Chat ID. Contoh: QD6H9CX78SS   |



<a name="search-message"></a>
## Search Message

Mencari pesan secara global, menampilkan list suggestion message baik itu dari private chat maupun group chat.

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/search-message

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - searchMessage()
- App\Services\InternalChatService
    - searchMessage()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi                      |
|   :-                         |   :-                 |   :-                             |
|   :-                         |   :-                 |   :-                             |
|   keyword                    |    String            |   Kata kunci pesan yang ingin dicari        |

<br>

Untuk menampilkan room chat berdasarkan pesan yang dicari, dapat menggunakan API berikut

> {info} Lihat: <a href="#show-chat-detail">Show Chat Detail</a>



<a name="push-notification"></a>
## Push Notification

Notification dipanggil ketika pesan berhasil terkirim. Saat ini notification tidak menggunakan Laravel Queue. Untuk implementasi kedepannya lebih baik jika menggunakan Queue.

#### Prerequisite
- Setup akun Google untuk Firebase

### Source Code:
```php
# On-Demand Notifications
Notification::route('firebase', $current_user->fcm_token)
                ->notify(new SendPushNotification(
                    $current_user->name, 'New message', $receiver_data->fcm_token, $current_user_avatar
                ));
```

### Resources:
```php
# Package
kutia-software-company/larafirebase versi 1.3

# JS
public/firebase-messaging-sw.js
resources/views/layouts/firebase-setup/firebase-setup.blade.php

# Config File
config/larafirebase.php

# Class
app/Notifications/SendPushNotification.php

```


---

<a name="private-chat"></a>
## Private Chat

Percakapan personal yang dilakukan antara dua agent.
<br>
Termasuk di dalamnya terdapat fitur:
- Membalas Bubble Chat
- Mengirimkan File

<a name="reply-private-chat"></a>
## Reply Private Chat

### Resources:
```php
# URL

# routes/web.php

# Class

# Views

```

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/reply

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - replyChat()
- app\Services\InternalChatService
    - replyChat()
    - replyChatToGroup()
- app\Notifications\SendPushNotification
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   chat_id                    |    String            |   Chat ID. Contoh: QD6H9CX78SS   |
|   receiver                   |    Integer           |   ID agent penerima pesan        |
|   message                    |    String            |   Pesan yang akan dikirim        |
|   parent                     |    Integer           |   ID bubble chat. Jika diisi, maka bubble chat yang dikirim akan bertujuan untuk membalas bubble chat tersebut.    |
|   file_id                    |    Integer           |   ID file yang akan dikirim. `message` menjadi opsional ketika `file_id` dikirim    |

>{info} Lihat: <a href="#upload-file">Upload File</a>



---

<a name="group-chat"></a>
## Group Chat
Percakapan personal yang dilakukan antara dua agent.
<br>
Termasuk di dalamnya terdapat fitur:
- Membalas Bubble Chat
- Mengirimkan File
- Membuat Grup Baru
- Menambahkan Member ke Dalam Grup
- Menghapus Member Grup
- Mengedit Grup



<a name="create-group"></a>
## Create Group

API untuk membuat grup. Ketika sukses, akan menambahkan grup pada List Chat Group.

### API
```php
# routes/api.php
- [POST] /api/agent/chat-group

# Class & Function
- app\Http\Controllers\API\ChatGroupController
    - store()
- App\Services\ChatGroupService
    - store()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   `application/json | multipart/form-data`   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi                      |
|   :-                         |   :-                 |   :-                             |
|   name                       |    String            |   Nama grup                      |
|   description                |    String            |   (Opsional) Deskripsi grup      |
|   icon                       |    File              |   (Opsional) Icon/foto grup      |



<a name="show-group-detail"></a>
## Show Group Detail

Menampilkan detail informasi grup.

### API
```php
# routes/api.php
- [GET] /api/agent/chat-group/{id}

# Class & Function
- app\Http\Controllers\API\ChatGroupController
    - store()
- App\Services\ChatGroupService
    - store()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |
|   id                         |   Integer            |   ID Grup             |



<a name="delete-group"></a>
## Delete Group

API untuk menghapus grup.

### API
```php
# routes/api.php
- [DELETE] /api/agent/chat-group/{id}

# Class & Function
- app\Http\Controllers\API\ChatGroupController
    - destroy()
- App\Services\ChatGroupService
    - destroy()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |
|   id                         |   Integer            |   ID Grup             |



<a name="update-group"></a>
## Update Group

API untuk memperbarui/mengedit/mengupdate grup.

### API
```php
# routes/api.php
- [POST] /api/agent/chat-group/update

# Class & Function
- app\Http\Controllers\API\ChatGroupController
    - update()
- App\Services\ChatGroupService
    - update()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   `application/json | multipart/form-data`   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi                      |
|   :-                         |   :-                 |   :-                             |
|   name                       |    String            |   Nama grup                      |
|   description                |    String            |   (Opsional) Deskripsi grup      |
|   icon                       |    File | String     |   (Opsional) Icon/foto grup      |

### Example
```json
# Update with Image
Content-Type: multipart/form-data

## Request Payload
{
    "id": 3,
    "name": "my group",
    "description": "always up to date",
    "icon": (file)
}


# Update seluruh field
Content-Type: application/json

## Request Payload
{
    "id": 3,
    "name": "my group",
    "description": "always up to date",
    "icon": "null"                            # String value, will delete the icon
}


# Update but do not update the image
Content-Type: application/json

## Request Payload
{
    "id": 3,
    "name": "my group",
    "description": "always up to date"
}
```



<a name="group-member"></a>
## Group Member

Menambahkan/menghapus agent dari grup.

### API
```php
# routes/api.php
- [POST] /api/agent/chat-group/{type}

# Class & Function
- app\Http\Controllers\API\ChatGroupController
    - attachAgentToChatGroup()
- App\Services\ChatGroupService
    - updateAgentToGroup('attach')
    - updateAgentToGroup('detach')
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |
|   type                       |   `attach-agent | detach-agent`     |   Tipe request. Terdiri dari: <br> - attach-agent, untuk menambahkan agent dari grup <br> - detach-agent, untuk menghapus agent dari grup     |

<br>

#### Request Payload
|   Key Name                   |   Value              |   Deskripsi                      |
|   :-                         |   :-                 |   :-                             |
|   chat_group_id              |    Integer           |   ID group                       |
|   agent_ids                  |    Array             |   ID agent. Contoh: [92, 93]     |



<a name="get-group-notification"></a>
## Get Chat Group Notification

Menampilkan histori masuknya agent ke dalam grup maupun keluarnya agent dari grup.

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/get-notification

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - getNotification()
- app\Services\InternalChatService
    - getNotification()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |



<a name="update-group-notification"></a>
## Update Read Status in Chat Group Notification

Mengupdate flagging notifikasi jika user telah membacanya.

### API
```php
# routes/api.php
- [POST] /api/chat/agent/internal/update-read-notification

# Class & Function
- app\Http\Controllers\API\InternalChatController
    - updateNotification()
- app\Services\InternalChatService
    - updateNotificationByField()
```

|   Query/Parameter Name       |   Value              |   Deskripsi           |
|   :-                         |   :-                 |   :-                  |
|   Authorization              |   Bearer token       |   Request Headers     |
|   Content-Type               |   application/json   |   Request Headers     |
|   X-Requested-With           |   XMLHttpRequest     |   Request Headers     |