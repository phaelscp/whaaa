import {DataTypes, QueryInterface} from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Queues", "keywords", {
      type: DataTypes.TEXT,
      allowNull: true,
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "keywords")
  }
};
