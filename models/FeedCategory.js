"use strict"

var co = require('co');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('FeedCategory', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    owner_uid: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    collapsed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    order_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    parent_cat: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    view_settings: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    }
  }, {

    //
    // Options
    //

    name: {
      plural: 'FeedCategories',
      singular: 'FeedCategory'
    },
    tableName: 'ttrss_feed_categories',


    //
    // static methods
    //

    classMethods: {

      /**
       * method used to declare all model associations
       * @param {Object} models
       */
      associate: function(models) {
        models.importModels([ 'User', 'Feed', 'FeedCategory', 'Filter2Rule' ]);
        models.FeedCategory.belongsTo(models.User, { foreignKey: 'owner_uid' });
        models.FeedCategory.hasMany(models.Feed, { foreignKey: 'cat_id' });
        models.FeedCategory.hasMany(models.Filter2Rule, { foreignKey: 'cat_id' });

        // Feed Category
        models.FeedCategory.hasMany(models.FeedCategory, {
          foreignKey: 'parent_cat',
          as: 'Children'
        });
        models.FeedCategory.belongsTo(models.FeedCategory, {
          foreignKey: 'parent_cat',
          as: 'Parent'
        });
      }

    } // end static methods

  });
};
