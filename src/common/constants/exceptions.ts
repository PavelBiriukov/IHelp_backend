export default {
  categories: {
    notFound: 'Категория не найдена',
  },
  users: {
    notFound: 'Пользователь с таким id не найден или не передан id пользователя',
    onlyForVolunteers: 'Действие разрешено только для волонтеров',
    onlyForRecipients: 'Действие разрешено только для реципиентов',
    onlyForAdmins: 'Действие разрешено только для администраторов с соответствующими правами',
    onlyForMaster: 'Действие разрешено только для главного администратора',
    userCreating: 'Этим методом разрешено создавать только профиль реципиента или волонтёра',
    adminCreating: 'Этим методом разрешено создавать только профиль администратора',
    notUniqueLogin: 'Пользователь с таким логином уже зарегистрирован',
    notUniqueVk: 'Пользователь с таким id vkontakte уже зарегистрирован',
    notForKeys: 'Этим методом разрешено изменять статусы до уровня 2 (подтвержден и проверен)',
  },
  tasks: {
    notFound: 'Заявка не найдена',
    sameTask: 'У реципиента уже есть не закрытая заявка в данной категории',

    wrongCompletionDate: 'Время исполнения заявки не может быть меньше текущего времени',
    noTimeForRefusal:
      'До времени исполнения заявки осталось меньше суток - отказ от заявки возможен только через администратора',
    cancelForbidden:
      'Заявка уже принята волонтером - отмена заявки возможена только через администратора',
    onlyForCreated: 'Действие разрешено только над заявками со статусом Создана',
    onlyForAccepted: 'Действие разрешено только над заявками со статусом В работе',
    wrongUser: 'Пользователь не является стороной заявки и не имеет доступа к ней',
    wrongStatus: 'Статус пользователя не соответствует категории заявки',
  },
  auth: {
    wrongLoginOrPassword: 'Пользователь с таким логином не найден или неверный пароль',
    unauthorized: 'Пользователь не авторизован',
    blocked: 'Пользователь заблокирован',
    roleRequired: 'Роль должна быть recipient или volunteer',
  },
  dbCodes: {
    notUnique: 11000,
  },
  objectId: {
    wrongId: 'Id должен быть строкой из 24 шестнадцатеричных символов',
  },
  contacts: {
    alreadyCreated: 'Запись с контактами уже создана. Для редактирования используйте методы PATCH.',
  },
  chats: {
    noId: 'Id чата не введено',
    noSender: 'Нет отправителя',
    isEmpty: 'Сообщение не должно быть пустым',
  },
};
