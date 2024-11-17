const db = require('../models');
const Users = db.users;

const Hobbies = db.hobbies;

const Events = db.events;

const Friends = db.friends;

const Chats = db.chats;

const HobbiesData = [
  {
    name: 'Willard Libby',
  },

  {
    name: 'Theodosius Dobzhansky',
  },

  {
    name: 'Edward O. Wilson',
  },

  {
    name: 'Franz Boas',
  },
];

const EventsData = [
  {
    name_event: 'Contact the tower',

    ubication: 'Contact the tower',

    date: new Date('2024-08-01'),

    // type code here for "images" field

    // type code here for "relation_many" field
  },

  {
    name_event: "Goin' hog huntin'",

    ubication: 'That damn Bill Stull',

    date: new Date('2023-12-31'),

    // type code here for "images" field

    // type code here for "relation_many" field
  },

  {
    name_event: 'Reminds me of my old girlfriend Olga Goodntight',

    ubication: 'That damn Bill Stull',

    date: new Date('2024-01-27'),

    // type code here for "images" field

    // type code here for "relation_many" field
  },

  {
    name_event: "I'm washing my hands of it",

    ubication: "C'mon Naomi",

    date: new Date('2024-02-03'),

    // type code here for "images" field

    // type code here for "relation_many" field
  },
];

const FriendsData = [{}, {}, {}, {}];

const ChatsData = [
  {
    sender: 'Got depression, Smith and Wessen',

    receiver: "That Barbala couldn't fly his way out of a wet paper bag",

    date: new Date('2024-04-04'),

    block: true,

    message: 'That damn Bill Stull',
  },

  {
    sender: 'I want my 5$ back',

    receiver: "That's messed up",

    date: new Date('2024-08-18'),

    block: false,

    message: 'My buddy Harlen',
  },

  {
    sender: 'Turd gone wrong',

    receiver: 'Reminds me of my old girlfriend Olga Goodntight',

    date: new Date('2024-02-04'),

    block: false,

    message: 'Texas!',
  },

  {
    sender: 'My buddy Harlen',

    receiver: "How 'bout them Cowboys",

    date: new Date('2024-04-11'),

    block: true,

    message: 'Contact the tower',
  },
];

// Similar logic for "relation_many"

// Similar logic for "relation_many"

// Similar logic for "relation_many"

// Similar logic for "relation_many"

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await Hobbies.bulkCreate(HobbiesData);

    await Events.bulkCreate(EventsData);

    await Friends.bulkCreate(FriendsData);

    await Chats.bulkCreate(ChatsData);

    await Promise.all([
      // Similar logic for "relation_many"
      // Similar logic for "relation_many"
      // Similar logic for "relation_many"
      // Similar logic for "relation_many"
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('hobbies', null, {});

    await queryInterface.bulkDelete('events', null, {});

    await queryInterface.bulkDelete('friends', null, {});

    await queryInterface.bulkDelete('chats', null, {});
  },
};
