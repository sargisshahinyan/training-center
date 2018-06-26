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

const GROUPS_TABLE = 'groups';
const GROUP_DAYS_TABLE = 'groupDays';
const COLUMN_NAME = 'startsAt';
const COLUMN_SPECS = {
	type: 'time',
	notNull: true,
	defaultValue: '00:00'
};

exports.up = function(db) {
	return db.removeColumn(GROUPS_TABLE, COLUMN_NAME).then(() => {
		return db.addColumn(GROUP_DAYS_TABLE, COLUMN_NAME, COLUMN_SPECS);
	}, () => {});
};

exports.down = function(db) {
	return db.removeColumn(GROUP_DAYS_TABLE, COLUMN_NAME).then(() => {
		return db.addColumn(GROUPS_TABLE, COLUMN_NAME, COLUMN_SPECS);
	}, () => {});
};

exports._meta = {
  "version": 1
};
