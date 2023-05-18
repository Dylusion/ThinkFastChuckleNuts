/**
 * @name ThinkFastChuckleNuts
 * @version 1.0.3
 * @source "https://github.com/Dylusion/ThinkFastChuckleNuts"
*/
const request = require("request");
const fs = require("fs");
const path = require("path");

const config = {
    info: {
        name: " Think Fast Chuckle Nuts",
        authors: [
            {
                name: "Dylusion",
                discord_id: "646854807608623104",
                github_username: "Dylusion"
            }
        ],
    github_raw:
      "",
    version: "1.0.3",
    description:
      "Adds flashbang effect every time a notification is received",
	},
  changelog: [
    {
      "title": "Update",
      "type": "update",
      "items": [
        "Added flashbang effect duration slider",
      ]
    }
  ],
  defaultConfig: [
    {
      type: "slider",
      name: "Flash Duration (1/10 Second)",
      note: "Sets the flash duration",
      min: 0.1,
      max: 2.0,
      id: "flashTime",
      value: 0.6,
      markers: [0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1.0,1.1,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2.0],
      stickToMarkers: true,
    },
    /*
    {
      type: "switch",
      name: "Enable on Do Not Disturb",
      note: "Enable flashbang effect while on Do Not Disturb",
      id: "disableOnDnd",
      value: false,
    },
    {
      type: "switch",
      name: "Disable DMs Notifications",
      note: "Disable flashbang effect for DM notifications",
      id: "ignoreDMs",
      value: false,
    },
    {
      type: "switch",
      name: "Disable Group DMs Notifications",
      note: "Disable flashbang effect for DM group notifications",
      id: "ignoreDMGroups",
      value: false,
    },
    {
      type: "textbox",
      name: "Ignored Users IDs (Split with `, `)",
      note: "Disable flashbang effect if message was sent from a specific user",
      id: "ignoredUsers",
      value: "",
    },
    {
      type: "textbox",
      name: "Ignored Servers IDs (Split with `, `)",
      note: "Disable flashbang effect if message was sent from a specific server.",
      id: "ignoredServers",
      value: "",
    },
    {
      type: "textbox",
      name: "Ignored Channels IDs (Split with `, `)",
      note: "Disable flashbang effect if message was sent from a specific channel.",
      id: "ignoredChannels",
      value: "",
    }
    */
  ]
  };

module.exports = !global.ZeresPluginLibrary
  ? class {
      constructor() {
        this._config = config;
      }

      load() {
        BdApi.showConfirmationModal(
          "Library plugin is needed",
          `The library plugin needed for AQWERT'sPluginBuilder is missing. Please click Download Now to install it.`,
          {
            confirmText: "Download",
            cancelText: "Cancel",
            onConfirm: () => {
              request.get(
                "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                (error, response, body) => {
                  if (error)
                    return electron.shell.openExternal(
                      "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                    );

                  fs.writeFileSync(
                    path.join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"),
                    body
                  );
                }
              );
            },
          }
        );
      }

      start() {}

      stop() {}
    }
  : (([Plugin, Library]) => {
      const {
        DiscordModules,
        WebpackModules,
        PluginUtilities,
        Settings,
        Patcher,
      } = Library;

      const {
        React,
        ReactDOM,
        Dispatcher,
        UserStore,
        ChannelStore,
        GuildStore,
        NavigationUtils,
        UserStatusStore,
        SelectedChannelStore,
        GuildMemberStore,
        // UserProfileModals,
        InviteActions,
      } = DiscordModules;
      const { Webpack } = BdApi;

      const ChannelTypes = Webpack.getModule(Webpack.Filters.byProps("GUILD_TEXT"), { searchExports: true });
      const MuteStore = WebpackModules.getByProps("isSuppressEveryoneEnabled");
      const isMentioned = { isRawMessageMentioned: WebpackModules.getModule(Webpack.Filters.byStrings("rawMessage", "suppressEveryone"), {searchExports: true}) };

      const classes = {
        ...WebpackModules.getByProps("horizontal", "flex", "justifyStart"),
        ...WebpackModules.getByProps("avatar", "alt"),
      };
      /* Created by Strencher */
      const Spring = WebpackModules.getModule(e => e.useSpring);
      const { useSpring, animated } = Spring;

      class plugin extends Plugin {
        constructor() {
          super();

          this.getSettingsPanel = () => {
            return this.buildSettingsPanel().getElement();
          };

          try {
            // QWERTLib.Toasts.create(["Successfully started ", React.createElement("strong", null, "In App Notifications"), "!"], {
            //     author: "QWERT Library",
            //     color: colors.online,
            //     icon: React.createElement(WebpackModules.findByDisplayName("Checkmark"), {
            //         style: {
            //             color: colors.online
            //         }
            //     }),
            //     time: 6000,
            //     onClick: () => {
            //         InviteActions.acceptInviteAndTransitionToInviteChannel("zMnHFAKsu3");
            //     }
            // })
          } catch (e) {
            console.log(
              `%c[InAppNotifications]%c Error!%c`,
              "color: #3a71c1;",
              "font-weight: 700; color: #b3001b;",
              "\n",
              e
            );
            BdApi.alert(
              "InAppNotifications",
              "There was an error while trying to start the plugin.\n Try checking the console for any errors from this plugin.\nFor any further support, join my support server (https://discord.gg/zJbXFXNAhJ)"
            );
          }

          const om = this.onMessage.bind(this);
          this.onMessage = (e) => {
            try {
              om(e);
            } catch (e) {
              console.log(
                `%c[InAppNotifications]%c Error!%c`,
                "color: #3a71c1;",
                "font-weight: 700; color: #b3001b;",
                "\n",
                e
              );
            }
          };
        }

        onStart() {
          Dispatcher.subscribe("MESSAGE_CREATE", this.onMessage);
        }


        onMessage({ message }) {
          const channel = ZeresPluginLibrary.DiscordModules.ChannelStore.getChannel(message.channel_id);
          if (!this.supposedToNotify(message, channel)) return;
          if (!this.checkSettings(message, channel)) return;
          console.log(message.content)
          console.log(ZeresPluginLibrary.DiscordModules.ElectronModule.getDiscordUtils())

          const flashTime = this.settings.flashTime;


          ZeresPluginLibrary.DOMTools.addStyle('TFCN', `#flashbang-div {
            position: absolute;
            top: 0px;
            bottom: 0px;
            right: 0px;
            left: 0px;
            background: #ffffff;
           
            animation-iteration-count: 1;
  
            animation: flash ease-out ${flashTime}s ;
            }
            @keyframes flash {
              40% {
                 opacity: 1;
              }
              100% {
                 opacity: 0;
              }
           }
          }`)

          const flashDiv = document.createElement("div")
          flashDiv.id = "flashbang-div"

          const root = document.getElementById("app-mount")
          root.append(flashDiv);

          setTimeout(() => {
            document.getElementById('flashbang-div').remove()
            ZeresPluginLibrary.DOMTools.removeStyle('TFCN')
          }, flashTime * 1000)

        }//----------------

        escapeRegex(string) {
          return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
        }

        supposedToNotify(message, channel) {
          if (message.author.id === UserStore.getCurrentUser().id) return false;
          if (channel.type === ChannelTypes["PUBLIC_THREAD"] && !channel.member) return false;
          const suppressEveryone = MuteStore.isSuppressEveryoneEnabled(
            message.guild_id || "@me"
          );
          const suppressRoles = MuteStore.isSuppressRolesEnabled(
            message.guild_id || "@me"
          );
          if (MuteStore.allowAllMessages(channel)) return true;
          return isMentioned.isRawMessageMentioned(
            {
              rawMessage: message,
              userId: UserStore.getCurrentUser().id,
              suppressEveryone,
              suppressRoles
            }
          );
        }

        checkSettings(message, channel) {
          let shouldNotify = true;
          const ignoredUsers = this.settings.ignoredUsers.trim().split(",");
          const ignoredServers = this.settings.ignoredServers.trim().split(",");
          const ignoredChannels = this.settings.ignoredChannels
            .trim()
            .split(",");
          const ignoreDMs = this.settings.ignoreDMs;
          const ignoreDMGroups = this.settings.ignoreDMGroups;

          const dontDisableOnDnd = this.settings.disableOnDnd;
          const isDnd =
            UserStatusStore.getStatus(UserStore.getCurrentUser().id) === "dnd";
          const disableIfNoFocus = this.settings.disableIfNoFocus;
          const hasFocus = document.hasFocus();

          if (dontDisableOnDnd) {
            shouldNotify = isDnd;
          }

          if (disableIfNoFocus) {
            if (!hasFocus) shouldNotify = false;
          }

          if (ignoreDMs) {
            if (channel.type === ChannelTypes["DM"]) shouldNotify = false;
          }

          if (ignoreDMGroups) {
            if (channel.type === ChannelTypes["GROUP_DM"]) shouldNotify = false;
          }

          if (ignoredUsers.includes(message.author.id)) shouldNotify = false;
          if (ignoredServers.includes(channel.guild_id)) shouldNotify = false;
          if (ignoredChannels.includes(channel.id)) shouldNotify = false;

          return shouldNotify;
        }

        onStop() {
          Dispatcher.unsubscribe("MESSAGE_CREATE", this.onMessage);
          Patcher.unpatchAll();
        }
      }

      return plugin;
    })(global.ZeresPluginLibrary.buildPlugin(config));