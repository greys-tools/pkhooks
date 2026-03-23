import { SvelteMap } from 'svelte/reactivity';
import { browser } from '$app/environment';

export const DEFAULTS = {
	mode: 'dark'
}

export const SettingsValues = {
	mode: [ 'dark', 'light' ],
}

let tmp = new SvelteMap();
if(browser) {
	if(('settings' in localStorage)) {
		var item = localStorage.getItem('settings')
		var data = JSON.parse(item);
		for(var k in data) {
			tmp.set(k, data[k]);
		}
	}

	for(var k in DEFAULTS) {
		if(!tmp.get(k)?.length) tmp.set(k, DEFAULTS[k]);
	}
}

export const settings = $state(tmp);

export const update = (setting, value) => {
	settings.set(setting, value);
	
	if(browser) localStorage.setItem('settings', JSON.stringify(toJSON(settings)));
	if(setting == 'mode') handleModeChange(settings);
}

const toJSON = (map) => {
	let obj = {};
	for(var [k, v] of map) {
		obj[k] = v;
	}
	return obj;
}

const handleModeChange = (val) => {
	if(!browser) return;
	var prefer = window.matchMedia('(prefers-color-scheme: dark)').matches;
	var mode = val.get('mode');
	if(mode == 'dark' || (mode == "system" && prefer)) window.document.documentElement.dataset.mode = 'dark';
	else if(mode == 'light' || (mode == "system" && !prefer)) window.document.documentElement.dataset.mode = 'light';
}