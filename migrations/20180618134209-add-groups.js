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
    return db.createTable('groups', {
	    id: {
	        type: 'int',
		    primaryKey: true,
		    autoIncrement: true
	    },
	    name: {
  		    type: 'string',
		    length: '50',
		    notNull: 'true'
	    },
	    subjectId: {
		    type: 'int',
		    notNull: true,
		    foreignKey: {
			    name: 'groups_ibfk_1',
			    table: 'subjects',
			    rules: {
				    onDelete: 'CASCADE',
				    onUpdate: 'CASCADE'
			    },
			    mapping: 'id'
		    }
	    },
	    userId: {
		    type: 'int',
		    notNull: true,
		    foreignKey: {
			    name: 'groups_ibfk_2',
			    table: 'users',
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
	return db.dropTable('groups');
};

exports._meta = {
  "version": 1
};
