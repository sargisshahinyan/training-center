'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const TABLE_NAME = 'groups',
	COLUMN_NAME = 'startsAt';

exports.up = function(db) {
	return db.addColumn(TABLE_NAME, COLUMN_NAME, {
		type: 'time',
		notNull: true,
		defaultValue: '00:00'
	});
};

exports.down = function(db) {
	return db.removeColumn(TABLE_NAME, COLUMN_NAME);
};

exports._meta = {
  "version": 1
};
