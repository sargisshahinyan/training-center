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

exports.up = function(db) {
  return db.createTable('studentsGroups', {
	  studentsId: {
		  type: 'int',
		  notNull: true,
		  foreignKey: {
			  name: 'studentsGroups_ibfk_1',
			  table: 'students',
			  rules: {
				  onDelete: 'CASCADE',
				  onUpdate: 'CASCADE'
			  },
			  mapping: 'id'
		  }
	  },
	  groupsId: {
		  type: 'int',
		  notNull: true,
		  foreignKey: {
			  name: 'studentsGroups_ibfk_2',
			  table: 'groups',
			  rules: {
				  onDelete: 'CASCADE',
				  onUpdate: 'CASCADE'
			  },
			  mapping: 'id'
		  }
	  }
  });
};

exports.down = function(db) {
	return db.dropTable('studentsGroups');
};

exports._meta = {
  "version": 1
};
