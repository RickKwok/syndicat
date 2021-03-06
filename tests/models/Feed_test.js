'use strict';


var l               = require('lodash');
var co              = require('co');
var chai            = require('chai');
var chaiAsPromised  = require('chai-as-promised');
var Sequelize       = require('sequelize');
var Promise         = Sequelize.Promise;
var fs              = Promise.promisifyAll(require('fs'));
var assert          = require('chai').assert;
// var models          = require('../models');


chai.use(chaiAsPromised);

global.l = l;
global.co = co;
global.chai = chai;
global.expect = chai.expect;
global.chaiAsPromised = chaiAsPromised;
global.fs = fs;

/**
 * get a test database
 */
global.getTestDB = co.wrap(function* () {
  let name = 'test-' +  process.hrtime().join('');
  let sequelize = new Sequelize(name, 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: ':memory:',
    pool: null /* {
                  max: 1,
                  min: 1,
                  idle: 1
                  }*/,
      // typeValidation: true,
    logging: null, //console.log, // TODO: output to log file
    //benchmark: true,
    define: {
      timestamps: false,
      underscored: true
    }
  });
  yield sequelize.query('PRAGMA journal_mode=MEMORY');
  let models = require('../../models')(sequelize);
  return sequelize;
});

global.getUser = function(){
  return {
    id: 1,
    login: 'sdfasd',
    pwd_hash: 'sdfads'
  };
}

global.getFeed = function(){
  return {
		id: 1,
		owner_uid: 1,
		title: 'Test Feed',
		feed_url: 'Test Feed'
	};
}


describe('Feeds', function(){

  it('100 models', co.wrap(function* (){
    for(let i = 1; i < 100; i++){
      let sequelize = yield getTestDB();
      let models = sequelize.models;
      let usr1 = yield models.User.create({
        id: i,
        login: 'sdfasd',
        pwd_hash: 'sdfads'
      });
      let feed1 = yield models.Feed.create({
        id: i,
        owner_uid: i,
        title: 'test title',
        feed_url: 'google.com',
        icon_url: 'google.com',
        update_interval: 1000000,
        site_url: 'google.com'
      });
      let feeds = yield models.Feed.findAll({ attributes: ['id'] });
      let feed = feeds[0];
      expect(feed).to.have.property('id');
      expect(feed.id).to.equal(i);
    }
  }));
  it('200 models', co.wrap(function* (){
    for(let i = 1; i < 200; i++){
      let sequelize = yield getTestDB();
      let models = sequelize.models;
      let usr1 = yield models.User.create({
        id: i,
        login: 'sdfasd',
        pwd_hash: 'sdfads'
      });
      let feed1 = yield models.Feed.create({
        id: i,
        owner_uid: i,
        title: 'test title',
        feed_url: 'google.com',
        icon_url: 'google.com',
        site_url: 'google.com'
      });
      let feeds = yield models.Feed.findAll({ attributes: ['id'] });
      let feed = feeds[0];
      expect(feed).to.have.property('id');
      expect(feed.id).to.equal(i);
    }
  }));

  it('Auto increments on id', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models;
    let Feed = sequelize.models.Feed;
    
    let user1 = yield models.User.create({
        id: 1,
        login: 'sdfasd',
        pwd_hash: 'sdfads'
      });
    let feed1 = yield getFeed();
    let feed2 = yield getFeed();
    delete(feed1.id);
    delete(feed2.id);
    yield Feed.create(feed1);
    yield Feed.create(feed2);

    let retrieve = yield Feed.findAll();
    expect(retrieve).to.have.lengthOf(2);
    expect(retrieve[1].id).to.equal(retrieve[0].id + 1);
  }));

  it('Requires id to be an integer', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let Feed = sequelize.models.Feed;
    let models = sequelize.models;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });
    let feed1 = yield getFeed();
    feed1.id = 'String';
    let success = false;
    yield Feed.create(feed1).then(function(response) {
      success = true;
    }).catch(function(e) {
      expect(e).to.not.be.null;
    });
    assert.isFalse(success, 'Exception not thrown with id as a string');
  }));

  it('Requires id to be unique', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let User = sequelize.models.User;
    let Feed = sequelize.models.Feed;
    let user1 = yield getUser();
    let insert1 = yield getFeed();
    let insert2 = yield getFeed();
    let success = false;
    yield User.create(user1);
    yield Feed.create(insert1);
    yield Feed.create(insert2).then(function(response) {
      success = true;
    }).catch(function(e) {
      expect(e).to.not.be.null;
    });
    assert.isFalse(success, 'Exception not thrown when id is not unique');
  }));

  it('Requires title to be present', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models;
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });
    let insert = yield getFeed();
    delete(insert.title);

    let success = false;
    yield Feed.create(insert).then(function(response) {
      success = true;
    }).catch(function(e) {
      expect(e).to.not.be.null;
    });
    assert.isFalse(success, 'Exception not thrown when title is not present');
  }));

  it('Requires owner_uid to be present', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });
    let insert = yield getFeed();
    delete(insert.owner_uid);

    let success = false;
    yield Feed.create(insert).then(function(response) {
      success = true;
    }).catch(function(e) {
      expect(e).to.not.be.null;
    });
    assert.isFalse(success, 'Exception not thrown when owner_uid is not present');
  }));

  it('Requires feed_url to be present', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });
    let insert = yield getFeed();
    delete(insert.feed_url);

    let success = false;
    yield Feed.create(insert).then(function(response) {
      success = true;
    }).catch(function(e) {
      expect(e).to.not.be.null;
    });
    assert.isFalse(success, 'Exception not thrown when feed_url is not present');
  }));
  it('When update_interval not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.update_interval).to.equal(0);
  }));
  it('When icon_url not present default to empty string', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.site_url).to.equal('');
  }));
  it('When purge_interval not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.purge_interval).to.equal(0);
  }));
  it('When last_error not present default to empty string', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.last_error).to.equal('');
  }));
  it('When site_url not present default to empty string', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.site_url).to.equal('');
  }));
  it('When auth_login not present default to empty string', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.auth_login).to.equal('');
  }));
  it('When auth_pass not present default to empty string', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.auth_pass).to.equal('');
  }));



  it('When private not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.private).to.equal(false);
  }));
  it('When rtl_content not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.rtl_content).to.equal(false);
  }));

  it('When hidden not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.hidden).to.equal(false);
  }));
  it('When include_in_digest not present default to 1', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.include_in_digest).to.equal(true);
  }));



  it('When cache_images not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.cache_images).to.equal(false);
  }));
  it('When hide_images not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.hide_images).to.equal(false);
  }));


  it('When cache_content not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.cache_content).to.equal(false);
  }));
  it('When auth_pass_encrypted not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.auth_pass_encrypted).to.equal(false);
  }));
  it('When always_display_enclosures not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.always_display_enclosures).to.equal(false);
  }));
  it('When update_method not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.update_method).to.equal(0);
  }));
  it('When order_id not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.order_id).to.equal(0);
  }));
  it('When mark_unread_on_update not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.mark_unread_on_update).to.equal(false);
  }));
  it('When update_on_checksum_change not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.update_on_checksum_change).to.equal(false);
  }));
  it('When strip_images not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.strip_images).to.equal(false);
  }));
  it('When view_setting not present default to empty string', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    var fn = function(){
      return retrieve.view_setting;
    }

    expect(fn).to.not.throw(/view_setting is empty/);
  }));
  it('When pubsub_state not present default to 0', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.pubsub_state).to.equal(0);
  }));
  it('When feed_language not present default to empty string', co.wrap(function* () {
    let sequelize = yield getTestDB();
    let models = sequelize.models; 
    let Feed = sequelize.models.Feed;
    let usr1 = yield models.User.create({
      id: 1,
      login: 'sdfasd',
      pwd_hash: 'sdfads'
    });

    let insert = yield getFeed();
    yield Feed.create(insert);

    let retrieve = yield Feed.findById(insert.id);

    expect(retrieve.feed_language).to.equal('');
  }));
});

