import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { isMergeable } from 'src/utils/is_mergable';

class setting_prop<T>{
	v:T;
	setter:(v:T)=>any
	getter:()=>T
	constructor(v: T){
		this.v = v;
		this.setter=(v)=>{this.v =v}
		this.getter=()=>{return this.v}
	}
}
interface MyPluginSettings {
	[key:string]:object|setting_prop<any>
	auto_capitalize_titles: {
		enabled: setting_prop<boolean>,
		interval: setting_prop<number>,
	},
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	auto_capitalize_titles: {
		enabled:new setting_prop(false),
		interval:new setting_prop(600),
	},
}

export default class MyPlugin extends Plugin {
	settings:MyPluginSettings;

	async onload() {
		await this.loadSettings();
		(()=>{
			const targetObj = {
				name: 'John', // Key must exist
				age: 30,      // Can have additional keys
				address: {
				  street: '',  // Value type must match
				  city: 'Anytown',
				},
			  };
			for (const iterator in targetObj) {
				// let sym = Symbol("desc");
				// let obj:{[key:symbol]:any}={};
				// obj[sym]=1;
				// console.log(obj);
			}
		})()
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('This is a notice!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	update_settings(setting: object):string{
		try {
			this.settings = Object.assign({},this.settings , setting);
		} catch (error) {
			return "NOT-OK";
		}
		
		return "OK";
	}
	async setting_reset_to_default(){
		await this.saveData(DEFAULT_SETTINGS);
		this.settings = DEFAULT_SETTINGS;
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
			
		let setting_target = this.plugin.settings.auto_capitalize_titles;
		let setting2_1 = new Setting(containerEl);
		let setting2_2 = new Setting(containerEl);

		setting2_2.setName("timeout for title auto capitalization")
		let alertDiv = document.createElement("div");
		setting2_2.descEl.appendChild(alertDiv);
		setting2_2.addText(tc=>{
			tc.setValue(setting_target.interval.getter().toString());
			tc.setPlaceholder("a number representing timeout in seconds");
			tc.onChange(v=>{
				let n = Number(v);
				if(Number.isNaN(n)|| n<0){
					alertDiv.innerHTML = "number invalid";
				}else{
					alertDiv.innerHTML = "number valid";
					setting_target.interval.setter(n);
				}
				
			})
		})


		setting2_1.setName("auto capitalize titles")
		setting2_1.setDesc(`automatically capitalize title every time you create a new file , then gets disabled for [ ${setting_target.interval.getter()} ] seconds for that file`)
		setting2_1.addToggle(comp=>{
			comp.setValue(setting_target.enabled.getter());
			setting2_2.setDisabled(!comp.getValue());
			// console.log(!comp.getValue()); //debug
			
			comp.onChange(value=>{
				setting_target.enabled.setter(value);
				setting2_2.setDisabled(!comp.getValue());
				// console.log(!comp.getValue()); //debug
			})
		})
	}
	hide(){
		super.hide();

		// console.log("overriden hide() :)")
		// window.alert("ayo");
	}
}
