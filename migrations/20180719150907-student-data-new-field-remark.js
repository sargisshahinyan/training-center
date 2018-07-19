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

const TABLE_NAME = 'students',
	COLUMN_NAME = 'remark';

exports.up = function(db) {
	return db.addColumn(TABLE_NAME, COLUMN_NAME, {
		type: 'string',
		notNull: true,
		defaultValue: ''
	});
};

exports.down = function(db) {
	return db.removeColumn(TABLE_NAME, COLUMN_NAME);
};

exports._meta = {
  "version": 1
};
