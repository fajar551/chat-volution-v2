# Manages

-   [Departments](#departments)
-   [Staff](#staff)
-   [Agents](#agents)
-   [Topics](#topics)
-   [Chat-Labels](#chat-labels)

---

<a name="departments"></a>

## Departments

Merupakan sebuah feature untuk memanage department dan hanya dapat di akses oleh user dengan role <b><i>Company</i></b>, dan memiliki 4 action, yaitu:

-   <b> List Departments</b>
    <br>
    Merupakan feature turunan dari department, yang digunakan untuk menampilkan list department yang tersedia di perusahaan tersebut.
    <br>

    #### Resources:

```php
# URL
/departments

# routes/web.php
/departments

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\departments\departments.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\departments.js

/** API */
# routes/api.php
- [POST] /api/agent/department/list

# Class
- app\Http\Controllers\API\DepartmentController
- app\Models\Department
```

-   <b>Add Department</b>
    <br>
    Merupakan feature turunan dari department, yang digunakan oleh seorang user role <b><i>Company</i></b> untuk menambahkan department yang ada di perusahaannya.
    <br>

    #### Resources:

```php
# URL
/add-department

# routes/web.php
/add-department

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\departments\add-department.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\add-department.js

/** API */
# routes/api.php
- [POST] /api/agent/department

# Class
- app\Http\Controllers\API\DepartmentController
- app\Models\Department
```

-   <b>Update Department</b>
    <br>
    Merupakan feature turunan dari department, yang digunakan untuk melakukan perubahan data dari department yang dipilih.
    #### Resources:

```php
# URL
/edit-department

# routes/web.php
/edit-department

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\departments\edit-department.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\edit-department.js

/** API */
# routes/api.php
- [GET] /api/agent/department/{id_department}
- [PUT] /api/agent/department

# Class
- app\Http\Controllers\API\DepartmentController
- app\Models\Department
```

-   <b>Remove Department</b>
    <br>
    Merupakan feature turunan dari department, yang terdapat di menu list, dan digunakan untuk menghapus department yang dipilih.
    #### Resources:

```php
# URL
/departments

# routes/web.php
/departments

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\departments\departments.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\edit-department.js
//Note: delete department menggunakan fungsi ("deleteDepartment")

/** API */
# routes/api.php
- [DELETE] /api/agent/department

# Class
- app\Http\Controllers\API\DepartmentController
- app\Models\Department
```

---

<a name="staff"></a>

## Staff

Merupakan sebuah feature untuk memanage user dengan role <b><i>Staff</i></b>, dan hanya dapat di akses oleh user dengan role <b><i>Admin</i></b>, <b><i>Company</i></b>, dan memiliki 4 action, yaitu:

-   <b> List Staff</b>
    <br>
    Merupakan feature yang digunakan untuk melihat seluruh user dengan role staff
    #### Resources:

```php
# URL
/staff

# routes/web.php
/staff

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\users\users.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\users.js
/* Note:
    1. url untuk akses admin = /api/agent/admin/list/{typeMenu}
    2. url selain akses admin = /api/agent/list/{typeMenu}
    3. typeMenu di ambil dari label yang terdapat di html, dimana menjadi
       patokan menu apa yang sedang dibuka
*/

/* Routes API */
# routes/api.php[Admin]
- [GET] /api/agent/admin/list/staff

# routes/api.php[Company]
- [GET] /api/agent/list/staff

# Class
- app\Http\Controllers\API\AgentController
- app\Models\Agent
```

-   <b>Add Staff</b>
    <br>
    Merupakan feature yang digunakan oleh seorang user role <b><i>Company</i></b> untuk menambahkan staff yang ada di perusahaannya.
    #### Resources:

```php
# URL
/add-staff

# routes/web.php
/add-staff

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\users\add-users.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\add-user.js
/* Note:
    1. url untuk akses admin = /api/agent/admin
    2. url selain akses admin = /api/agent
    3. setiap melakukan penambahan user baru, maka akan ada validasi
       role berdasarkan menu yang di akses.
       contoh: misalkan company budy bisa mengakses 2 menu,
               staff dan agent, dan sih budy membuka staff,
               maka user yang ditambah adalah staff
*/

/* Routes API */
# routes/api.php[Admin]
- [POST] /api/agent/admin

# routes/api.php[Company]
- [POST] /api/agent

# Class
- app\Http\Controllers\API\AgentController
- app\Models\Agent
```

-   <b>Update Staff</b>
    <br>
    Merupakan feature yang digunakan untuk melakukan perubahan data dari staff yang dipilih.
    #### Resources:

```php
# URL
/edit-staff

# routes/web.php
/edit-staff

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\users\edit-users.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\edit-user.js
/* Note:
    update yang diperbolehkan hanya nama dan status 0|1
*/

/* Routes API */
- [PUT] /api/agent

# Class
- app\Http\Controllers\API\AgentController
- app\Models\Agent
```

-   <b>Update Status Staff</b>
    <br>
    Merupakan feature yang digunakan untuk mengupdate status user role staff apakah aktif/tidak.
    #### Resources:

```php
# URL
/staff

# routes/web.php
/staff

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\users\users.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\users.js
/* Note:
    1. url untuk akses admin = /api/agent/admin
    2. url selain akses admin = /api/agent/status
    3. status menggunakan interger dengan 2 value:  0 | 1
*/

/* Routes API */
# routes/api.php[Admin]
- [GET] /api/agent/admin

# routes/api.php[Company]
- [GET] /api/agent/status

# Class
- app\Http\Controllers\API\AgentController
- app\Models\Agent
```

---

<a name="agents"></a>

## Agents

Merupakan sebuah feature untuk memanage user dengan role <b><i>Agent</i></b>, dan hanya dapat di akses oleh user dengan role <b><i>Admin</i></b>, <b><i>Company</i></b> & <b><i>Staff</i></b>, dan memiliki 4 action, yaitu:

-   <b> List Agents</b>
    <br>
    Merupakan feature yang digunakan untuk melihat seluruh user dengan role agent, dan untuk user role <b><i>Staff</i></b> hanya dapat melihat agent yang menjadi bawahannya saja.
    #### Resources:

```php
# URL
/agents

# routes/web.php
/agents

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\users\users.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\users\users.js
/* Note:
    1. url untuk akses admin = /api/agent/admin/list/{typeMenu}
    2. url selain akses admin = /api/agent/list/{typeMenu}
    3. typeMenu di ambil dari label yang terdapat di html, dimana menjadi
       patokan menu apa yang sedang dibuka
*/

/* Routes API */
# routes/api.php[Admin]
- [GET] /api/agent/admin/list/agent

# routes/api.php[Company]
- [GET] /api/agent/list/agent

# Class
- app\Http\Controllers\API\AgentController
- app\Models\Agent
```

-   <b>Add Agent</b>
    <br>
    Merupakan feature yang digunakan oleh seorang user role <b><i>Company</i></b> maupun <b><i>Staff</i></b> untuk menambahkan seorang <b><i>Agent</i></b>.
    #### Resources:

```php
# URL
/add-agent

# routes/web.php
/add-agent

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\users\add-users.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\departments\add-user.js
/* Note:
    1. url untuk akses admin = /api/agent/admin
    2. url akses untuk user role company dan staff = /api/agent
    3. setiap melakukan penambahan user baru, maka akan ada validasi
       role berdasarkan menu yang di akses.
       contoh: misalkan company budy bisa mengakses 2 menu,
               staff dan agent, dan sih budy membuka staff,
               maka user yang ditambah adalah staff
*/

/* Routes API */
# routes/api.php[Admin]
- [POST] /api/agent/admin

# routes/api.php[Company, Staff]
- [POST] /api/agent

# Class
- app\Http\Controllers\API\AgentController
- app\Models\Agent

```

-   <b>Update Agent</b>
    <br>
    Merupakan feature yang digunakan untuk melakukan perubahan data dari <b><i>Agent</i></b> yang dipilih.

#### Resources:

```php
# URL
/edit-agent

# routes/web.php
/edit-agent

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\users\edit-users.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\users\edit-user.js
/* Note:
    update yang diperbolehkan hanya nama dan status 0|1
*/

/* Routes API */
- [PUT] /api/agent

# Class
- app\Http\Controllers\API\AgentController
- app\Models\Agent
```

-   <b>Update Status Agent</b>
    <br>
    Merupakan feature yang digunakan untuk mengupdate status user role <b><i>Agent</i></b> apakah aktif/tidak.
    #### Resources:

```php
# URL
/agents

# routes/web.php
/agents

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\users\users.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\users\users.js
/* Note:
    1. url untuk akses admin = /api/agent/admin
    2. url selain akses admin = /api/agent/status
    3. status menggunakan interger dengan 2 value:  0 | 1
*/

/* Routes API */
# routes/api.php[Admin]
- [GET] /api/agent/admin

# routes/api.php[Company]
- [GET] /api/agent/status

# Class
- app\Http\Controllers\API\AgentController
- app\Models\Agent
```

---

<a name="topics"></a>

## Topics

Merupakan sebuah feature untuk memanage sebuah topic di live chat, dan hanya dapat di akses oleh user dengan role <b><i>Company</i></b>, dan memiliki 5 action, yaitu:

-   <b> List Topics</b>
    <br>
    Merupakan feature yang digunakan untuk melihat seluruh topic yang telah di buat.
    #### Resources:

```php
# URL
/topics

# routes/web.php
/topics

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\topic\topic.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\topic\index.js

/* Routes API */
- [POST] /api/chat/topic/list

# Class
- app\Http\Controllers\API\TopicAgentController
- app\Models\Topic
- app\Models\TopicAgent
```

-   <b>Add Topic</b>
    <br>
    Merupakan feature yang digunakan untuk membuat topic baru agar tampil di live chat.
    #### Resources:

```php
# URL
/add-topics

# routes/web.php
/add-topics

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\topic\add-topic.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\topic\add.js

/* Routes API */
- [POST] /api/chat/topic

# Class
- app\Http\Controllers\API\TopicAgentController
- app\Models\Topic
- app\Models\TopicAgent
```

-   <b>Edit Topic</b>
    <br>
    Merupakan feature yang digunakan untuk merubah sebuah topic, dari topic yang sudah ada di list.
    #### Resources:

```php
# URL
/edit-topics

# routes/web.php
/edit-topics

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\topic\edit-topic.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\topic\edit.js

/* Routes API */
- [GET] /api/agent/topic/{id_topic}
- [PUT] /api/chat/topic

# Class
- app\Http\Controllers\API\TopicAgentController
- app\Models\Topic
- app\Models\TopicAgent
```

-   <b>Remove Topic</b>
    <br>
    Merupakan feature yang digunakan untuk menghapus sebuah topic yang dipilih.
    #### Resources:

```php
# URL
/topics

# routes/web.php
/topics

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\topic\topic.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\topic\index.js

/* Routes API */
- [DELETE] /api/chat/topic

# Class
- app\Http\Controllers\API\TopicAgentController
- app\Models\Topic
- app\Models\TopicAgent
```

-   <b>List Agent Topic</b>
    <br>
    Merupakan feature yang digunakan untuk mengoneksikan antar user role staf dan role agent agar terhubung dengan topic yang telah dibuat, feature ini hanya terdapat di menu Edit Topic.
    #### Resources:

```php
# URL
/edit-topics

# routes/web.php
/edit-topics

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\topic\edit-topic.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\topic\edit.js

/* Routes API */
- [GET] /api/agent/topic/select
/* untuk mengambil data list agent yang akan di tampilkan dimodal assign agent */

- [GET] /api/agent/topic/{id_topic}
/* untuk mengambil data list agent yang telah dipilih yang ada di table list agent topic */

- [POST] /api/agent/topic
/* untuk mengsave agent yang telah di pilih untuk mengisi topic terkait */

- [DELETE] /api/agent/topic
/* untuk menghapus user yang dipilih untuk tidak menghandel topic terkait */

# Class
- app\Http\Controllers\API\TopicAgentController
- app\Models\Topic
- app\Models\TopicAgent
```

---

<a name="chat-labels"></a>

## Chat Labels

Merupakan sebuah feature untuk memanage sebuah label yang akan digunakan di live chat, dan hanya dapat di akses oleh user dengan role <b><i>Company</i></b> dan memiliki 4 action, yaitu:

-   <b> List Labels</b>
    <br>
    Merupakan feature yang digunakan untuk melihat seluruh label yang telah di buat.
    #### Resources:

```php
# URL
/labels

# routes/web.php
/labels

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\labels\labels.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\labels\index.js

/* Routes API */
- [GET] /api/agent/chat-label/list

# Class
- app\Http\Controllers\API\LabelController
- app\Models\Labels
- App\Services\LabelService
```

-   <b>Add Label</b>
    <br>
    Merupakan feature yang digunakan untuk membuat label baru agar tampil di live chat.
    #### Resources:

```php
# URL
/add-label

# routes/web.php
/add-label

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\labels\add-label.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\labels\add.js

/* Routes API */
- [POST] /api/agent/chat-label

# Class
- app\Http\Controllers\API\LabelController
- app\Models\Labels
- App\Services\LabelService
```

-   <b>Edit Label</b>
    <br>
    Merupakan feature yang digunakan untuk merubah sebuah label, dari label yang sudah ada di list.

#### Resources:

```php
# URL
/edit-label

# routes/web.php
/edit-label

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\labels\edit-label.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\labels\edit.js

/* Routes API */
- [PUT] /api/agent/chat-label
/* untuk menyimpan pembaharuan data label */

- [GET] /api/agent/chat-label/{id_label}
/* untuk mengambil detail label yang ingin di ubah */

# Class
- app\Http\Controllers\API\LabelController
- app\Models\Labels
- App\Services\LabelService
```

-   <b>Remove Label</b>
    <br>
    Merupakan feature yang digunakan untuk menghapus sebuah label yang dipilih.
    #### Resources:

```php
# URL
/labels

# routes/web.php
/labels

# Class
- app\Http\Controllers\WEB\LiveChatController

#CSS
- public\assets\css\custom.css

# Views
- resources\views\live-chat\labels\labels.blade.php

#JS
- public\js\app\app.js
- public\js\live-chat\labels\index.js

/* Routes API */
- [DELETE] /api/agent/chat-label

# Class
- app\Http\Controllers\API\LabelController
- app\Models\Labels
- App\Services\LabelService
```
