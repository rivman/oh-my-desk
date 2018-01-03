const { BrowserWindow } = require('electron');
const Store = require('./Store');
const uuid = require('uuid/v4');
const url = require('url');
const path = require('path');

class WidgetManager {
	constructor() {
		this.windows = [];
		this.widgetStore = new Store({ configName: 'widgets', defaults: {} });

		// this is consumers of observer pattern createObserver will be passed widget
		// information
		this.createObserver = [
			this.openWindow.bind(this),
		];
		this.updateObserver = [];
		// deleteObserver will be passed widget id which be deleted
		this.deleteObserver = [];
	}

	create(_widget) {
		const widget = _widget;
		widget.id = uuid();
		this.widgetStore.set(widget.id, widget);

		this.createObserver.forEach((o) => { o(widget); });
	}

	update(widget) {
		this.widgetStore.set(widget.id, widget);
	}

	delete(id) {
		this.widgetStore.delete(id);
		if (this.windows[id]) {
			this.windows[id].close();
			delete this.windows[id];
		}

		this.deleteObserver.forEach((o) => { o(id); });
	}

	getWidgets() {
		return this.widgetStore.getAll();
	}

	openAllWindow() {
		const widgets = this.widgetStore.getAll();
		const keys = Object.keys(widgets);
		const values = Object.values(widgets);

		for (let i = 0; i < keys.length; i += 1) {
			this.openWindow(values[i]);
		}
	}

	openWindow(opt) {
		if (!opt.isActive) {
			return;
		}

		if (this.windows[opt.id]) {
			this.windows[opt.id].focus();
			return;
		}

		let win = new BrowserWindow({
			title: opt.name,
			x: opt.position.x,
			y: opt.position.y,
			width: opt.size.width,
			height: opt.size.height,
			alwaysOnTop: opt.isOnTop,
			autoHideMenuBar: true,
			skipTaskbar: true,
			show: false,
			frame: false,
		});

		if (opt.type === 'web') {
			// win.loadURL(opt.url, {userAgent: 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5
			// Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113
			// Mobile Safari/537.36'})
			win.loadURL(url.format({
				pathname: path.join(__dirname, 'static', 'index.html'),
				protocol: 'file:',
				slashes: true,
			}));
		} else {
			// some code creating window for native widget
		}

		win.webContents.on('did-finish-load', () => {
			win.setTitle(opt.name);
			win.webContents.send('widget-info', opt);
		});

		win.once('ready-to-show', () => {
			win.show();
		});

		win.on('closed', () => {
			win = null;
		});

		win.on('move', (() => {
			const [position] = win.getPosition();
			const _opt = opt;

			[_opt.position.x, _opt.position.y] = position;

			this.widgetStore.set(opt.id, opt);
		}));

		win.on('resize', (() => {
			const size = win.getSize();
			const _opt = opt;

			[_opt.size.width, _opt.size.height] = size;

			this
				.widgetStore
				.set(opt.id, opt);
		}));

		this.windows[opt.id] = win;
	}

	onUpdateTray(callback) {
		function funcWrapper() {
			callback(this.buildTrayContextMenuTemplate());
		}

		funcWrapper.bind(this)();

		this.createObserver.push(funcWrapper.bind(this));
		this.deleteObserver.push(funcWrapper.bind(this));
	}

	buildTrayContextMenuTemplate() {
		const menuTemplate = [];
		const widgets = this.getWidgets();
		const keys = Object.keys(widgets);
		const values = Object.values(widgets);
		let element = null;

		menuTemplate.push({ label: 'Apps', type: 'normal' });

		function openWindow(widget) {
			this.openWindow(widget);
		}

		for (let i = 0; i < keys.length; i += 1) {
			element = values[i];

			menuTemplate.push({
				label: element.name,
				type: 'normal',
				click: openWindow.bind(this, element),
			});
		}

		return menuTemplate;
	}
}

module.exports = WidgetManager;