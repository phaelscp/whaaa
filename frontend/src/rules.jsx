const rules = {
	user: {
		static: [],
	},

	superv: {
		static: [
			"drawer-superv-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
		],
	},

	admin: {
		static: [
			"dashboard:view",
			"drawer-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
			"user-table:editSpy",
			"user-table:editTricked",
			"ticket-options:deleteTicket",
			"contacts-page:deleteContact",
			"connections-page:actionButtons",
			"connections-page:addConnection",
			"connections-page:editOrDeleteConnection",
			"connections-page:restartConnection"
		],
	},
};

export default rules;