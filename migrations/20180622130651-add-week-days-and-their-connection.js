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

const WEEK_DAYS_TABLE = 'weekDays',
	GROUP_DAYS_TABLE = 'groupDays';

exports.up = function(db) {
	return db.createTable(WEEK_DAYS_TABLE, {
		id: {
			type: 'int',
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: 'string',
			notNull: true
		}
	}).then(function () {
		const week_days = [
			'Monday',
			'Tuesday',
			'Wednesday',
			'Thursday',
			'Friday',
			'Saturday'
		];
		return db.runSql(`INSERT INTO ${WEEK_DAYS_TABLE} (name) VALUES ('${week_days.join('\'),(\'')}')`);
	}, function(err) {
		console.log(err)
	}).then(function() {
		db.createTable(GROUP_DAYS_TABLE, {
			groupId: {
				type: 'int',
				notNull: true,
				foreignKey: {
					name: GROUP_DAYS_TABLE + '_ibfk_1',
					table: 'groups',
					rules: {
						onDelete: 'CASCADE',
						onUpdate: 'CASCADE'
					},
					mapping: 'id'
				}
			},
			weekDayId: {
				type: 'int',
				notNull: true,
				foreignKey: {
					name: GROUP_DAYS_TABLE + '_ibfk_2',
					table: WEEK_DAYS_TABLE,
					rules: {
						onDelete: 'CASCADE',
						onUpdate: 'CASCADE'
					},
					mapping: 'id'
				}
			}
		});
	}, function(err) {
		console.log(err)
	});
};

exports.down = function(db) {
	return db.dropTable(GROUP_DAYS_TABLE).then(function() {
		db.dropTable(WEEK_DAYS_TABLE);
	}, function(err) {
		console.log(err)
	});
};

exports._meta = {
  "version": 1
};
