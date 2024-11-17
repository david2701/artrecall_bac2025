const db = require('../models');
const FileDBApi = require('./file');
const crypto = require('crypto');
const Utils = require('../utils');

const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

module.exports = class EventsDBApi {
  static async create(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.create(
      {
        id: data.id || undefined,

        name_event: data.name_event || null,
        ubication: data.ubication || null,
        date: data.date || null,
        importHash: data.importHash || null,
        createdById: currentUser.id,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await events.setFriends(data.friends || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.events.getTableName(),
        belongsToColumn: 'image',
        belongsToId: events.id,
      },
      data.image,
      options,
    );

    return events;
  }

  static async bulkImport(data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    // Prepare data - wrapping individual data transformations in a map() method
    const eventsData = data.map((item, index) => ({
      id: item.id || undefined,

      name_event: item.name_event || null,
      ubication: item.ubication || null,
      date: item.date || null,
      importHash: item.importHash || null,
      createdById: currentUser.id,
      updatedById: currentUser.id,
      createdAt: new Date(Date.now() + index * 1000),
    }));

    // Bulk create items
    const events = await db.events.bulkCreate(eventsData, { transaction });

    // For each item created, replace relation files

    for (let i = 0; i < events.length; i++) {
      await FileDBApi.replaceRelationFiles(
        {
          belongsTo: db.events.getTableName(),
          belongsToColumn: 'image',
          belongsToId: events[i].id,
        },
        data[i].image,
        options,
      );
    }

    return events;
  }

  static async update(id, data, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findByPk(id, {}, { transaction });

    await events.update(
      {
        name_event: data.name_event || null,
        ubication: data.ubication || null,
        date: data.date || null,
        updatedById: currentUser.id,
      },
      { transaction },
    );

    await events.setFriends(data.friends || [], {
      transaction,
    });

    await FileDBApi.replaceRelationFiles(
      {
        belongsTo: db.events.getTableName(),
        belongsToColumn: 'image',
        belongsToId: events.id,
      },
      data.image,
      options,
    );

    return events;
  }

  static async deleteByIds(ids, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    });

    await db.sequelize.transaction(async (transaction) => {
      for (const record of events) {
        await record.update({ deletedBy: currentUser.id }, { transaction });
      }
      for (const record of events) {
        await record.destroy({ transaction });
      }
    });

    return events;
  }

  static async remove(id, options) {
    const currentUser = (options && options.currentUser) || { id: null };
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findByPk(id, options);

    await events.update(
      {
        deletedBy: currentUser.id,
      },
      {
        transaction,
      },
    );

    await events.destroy({
      transaction,
    });

    return events;
  }

  static async findBy(where, options) {
    const transaction = (options && options.transaction) || undefined;

    const events = await db.events.findOne({ where }, { transaction });

    if (!events) {
      return events;
    }

    const output = events.get({ plain: true });

    output.image = await events.getImage({
      transaction,
    });

    output.friends = await events.getFriends({
      transaction,
    });

    return output;
  }

  static async findAll(filter, options) {
    const limit = filter.limit || 0;
    let offset = 0;
    const currentPage = +filter.page;

    offset = currentPage * limit;

    const orderBy = null;

    const transaction = (options && options.transaction) || undefined;
    let where = {};
    let include = [
      {
        model: db.friends,
        as: 'friends',
        through: filter.friends
          ? {
              where: {
                [Op.or]: filter.friends.split('|').map((item) => {
                  return { ['Id']: Utils.uuid(item) };
                }),
              },
            }
          : null,
        required: filter.friends ? true : null,
      },

      {
        model: db.file,
        as: 'image',
      },
    ];

    if (filter) {
      if (filter.id) {
        where = {
          ...where,
          ['id']: Utils.uuid(filter.id),
        };
      }

      if (filter.name_event) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('events', 'name_event', filter.name_event),
        };
      }

      if (filter.ubication) {
        where = {
          ...where,
          [Op.and]: Utils.ilike('events', 'ubication', filter.ubication),
        };
      }

      if (filter.dateRange) {
        const [start, end] = filter.dateRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            date: {
              ...where.date,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            date: {
              ...where.date,
              [Op.lte]: end,
            },
          };
        }
      }

      if (
        filter.active === true ||
        filter.active === 'true' ||
        filter.active === false ||
        filter.active === 'false'
      ) {
        where = {
          ...where,
          active: filter.active === true || filter.active === 'true',
        };
      }

      if (filter.createdAtRange) {
        const [start, end] = filter.createdAtRange;

        if (start !== undefined && start !== null && start !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.gte]: start,
            },
          };
        }

        if (end !== undefined && end !== null && end !== '') {
          where = {
            ...where,
            ['createdAt']: {
              ...where.createdAt,
              [Op.lte]: end,
            },
          };
        }
      }
    }

    let { rows, count } = options?.countOnly
      ? {
          rows: [],
          count: await db.events.count({
            where,
            include,
            distinct: true,
            limit: limit ? Number(limit) : undefined,
            offset: offset ? Number(offset) : undefined,
            order:
              filter.field && filter.sort
                ? [[filter.field, filter.sort]]
                : [['createdAt', 'desc']],
            transaction,
          }),
        }
      : await db.events.findAndCountAll({
          where,
          include,
          distinct: true,
          limit: limit ? Number(limit) : undefined,
          offset: offset ? Number(offset) : undefined,
          order:
            filter.field && filter.sort
              ? [[filter.field, filter.sort]]
              : [['createdAt', 'desc']],
          transaction,
        });

    //    rows = await this._fillWithRelationsAndFilesForRows(
    //      rows,
    //      options,
    //    );

    return { rows, count };
  }

  static async findAllAutocomplete(query, limit) {
    let where = {};

    if (query) {
      where = {
        [Op.or]: [
          { ['id']: Utils.uuid(query) },
          Utils.ilike('events', 'id', query),
        ],
      };
    }

    const records = await db.events.findAll({
      attributes: ['id', 'id'],
      where,
      limit: limit ? Number(limit) : undefined,
      orderBy: [['id', 'ASC']],
    });

    return records.map((record) => ({
      id: record.id,
      label: record.id,
    }));
  }
};
