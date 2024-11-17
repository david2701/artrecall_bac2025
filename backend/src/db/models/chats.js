const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function (sequelize, DataTypes) {
  const chats = sequelize.define(
    'chats',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

      sender: {
        type: DataTypes.TEXT,
      },

      receiver: {
        type: DataTypes.TEXT,
      },

      date: {
        type: DataTypes.DATE,
      },

      block: {
        type: DataTypes.BOOLEAN,

        allowNull: false,
        defaultValue: false,
      },

      message: {
        type: DataTypes.TEXT,
      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  chats.associate = (db) => {
    /// loop through entities and it's fields, and if ref === current e[name] and create relation has many on parent entity

    //end loop

    db.chats.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.chats.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return chats;
};
