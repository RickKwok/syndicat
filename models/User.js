'use strict';

var tableNamePrefix = 'ttrss_';
var tableName = tableNamePrefix + 'users';

module.exports = function(sequelize, DataTypes) {

  /**
   * User
   *
   * An authenticated user account
   */
  var User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    login: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pwd_hash: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    access_level: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: '0'
    },
    theme_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    email_digest: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    last_digest_sent: {
      type: DataTypes.DATE,
      allowNull: true
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    created: {
      type: DataTypes.DATE,
      allowNull: true
    },
    twitter_oauth: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    otp_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: '0'
    },
    resetpass_token: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {

    //
    // Options
    //

    tableName: tableName,


    //
    // static methods
    //

    classMethods: {

    } // end static methods

  });

  return User;
};
