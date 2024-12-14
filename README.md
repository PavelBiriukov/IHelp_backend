~~Бриф [https://narrow-mountain-bc1.notion.site/3-13-1880e7396a9c4bbda3d1f33103fd01af](https://narrow-mountain-bc1.notion.site/3-13-1880e7396a9c4bbda3d1f33103fd01af)~~

Frontend [https://yapomogayu.workshop-projects.ru](https://yapomogayu.workshop-projects.ru)

IP адрес: 51.250.110.188

API [https://yapomogayu.workshop-projects.ru/api](https://yapomogayu.workshop-projects.ru/api)

Swagger: [http://yapomogayu.workshop-projects.ru/api/docs/api/actual](http://yapomogayu.workshop-projects.ru/api/docs/api/actual)

**Коллекция postman для обновленного api в корне проекта: postman_collection.json**

На текущий момент можно протестировать:

- создание админа, авторизацию;
- создание, удаление, редактирование постов.

Чтобы зарегистрировать админа необходимо в `AdminApiController` закомментировать `@UseGuards(JwtAuthGuard), @UseGuards(AccessControlGuard)`, в `@Post('create')` закомментировать `@AccessControlList({ role: UserRole.ADMIN, isRoot: true })` и добавить декоратор `@Public()`.

Чтобы запустить тесты, необходимо нажать 3 точки у имени коллекции, выбрать Run collection, затем Run yaPomogau.

Для админа автоматически создаются уникальные имя, логин, vkId, с которыми он будет зарегистрирован и авторизован.

После создания поста - id поста сохраняется в переменной и далее отправляется запрос на редактирование данного поста, а потом его удаление.

## Описание

Проект для волонтерской организации ЯПомогаю. Цель, создать удобное веб-приложение поиска волонтёров для помощи реципиентам. От выгула собак, до помощи людям с ограниченными возможностями.

## Установка и запуск в режиме разработки

Должнен быть установлен NodeJS v16 ^

1. [Склонировать репозиторий](https://github.com/ya-pomogau/backend)
   ```shell
   git clone git@github.com:ya-pomogau/backend.git
   ```
2. Скопировать `.env.example` в `.env.dev` и внести правки (**УДАЛЯТЬ** комментарии при копировании!):
   ```env
   SERVER_PORT=3001 # На своё усмотрение
   CONTAINER_PORT=3001 # На своё усмотрение, на этом порту будет слушать сервер
   DATABASE_HOST=i-help-db-dev # Название сервиса из docker-compose.dev.yml
   DATABASE_PORT=27017
   DATABASE_USERNAME= # Оставить пустым
   DATABASE_PASSWORD= # Оставить пустым
   DATABASE_NAME=ya-pomogau-db
   SALT=10
   JWT_KEY=e776c17dcf7b8de11a1647faa49b89c2 # Обязательно поменять!!!
   JWT_TTL=7d
   CORS_ORIGINS=*
   VK_APP_ID=51798618 # Не трогать, иначе отвалится авторизация VK
   VK_APP_SECRET=898A5ISDAGmscLIFz0JV # Не трогать, иначе отвалится авторизация VK
   ```
3. Установить docker:

   1. [Windows](https://www.docker.com/products/docker-desktop)
   2. [Ubuntu](https://docs.docker.com/engine/install/ubuntu/):

      1. Установите пакеты:
         ```shell
         sudo apt-get update
         sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
         ```
      2. Добавьте официальный ключ GPG Docker:

         ```shell
         curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
         ```

      3. Добавьте репозиторий Docker к источникам APT:

         ```shell
         sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
         ```

      4. Установите Docker:

         ```shell
         sudo apt-get update
         sudo apt-get install docker-ce
         ```

4. Собрать и запустить docker-контейнер

   ```shell
   docker compose -f docker-compose.dev.yml --env-file=.env.dev up --build

   # Или с помощью Makefile
   make run-dev

   # Или с помощью Npm
   npm run start:docker
   ```

   Cервер будет доступен на `SERVER_PORT` из `.env.dev`, по дефолту `3001` порт

## Не реализована функциональность

- [x] ~~учетные записи пользователей~~
- [ ] чат
- [x] ~~редактирования заявок~~
- [x] ~~регистрации~~
- [x] ~~общие страницы~~
- [x] ~~страницы пользователей~~
- [ ] сохранение аватаров и файлов в чатах
