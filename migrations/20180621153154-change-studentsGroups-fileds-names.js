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
  return db.renameColumn('studentsGroups', 'studentsId', 'studentId', {
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
  }).then(function() {
	  db.renameColumn('studentsGroups', 'groupsId', 'groupId', {
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
	  });
  }, function () {});
};

exports.down = function(db) {
	return db.renameColumn('studentsGroups', 'studentId', 'studentsId', {
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
	}).then(function() {
		db.renameColumn('studentsGroups', 'groupId', 'groupsId', {
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
		});
	}, function () {});
};

exports._meta = {
  "version": 1
};
