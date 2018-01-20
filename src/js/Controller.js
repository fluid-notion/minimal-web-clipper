import $ from 'zepto';
import keycode from 'keycode';
import debounce from 'lodash.debounce';
import overlay from 'ios-overlay';
import _debug from 'debug';
import {getSpinner} from './spinner';
import checkImg from 'ios-overlay/img/check.png';
import {Clipper} from './Clipper';
import {timeout} from './timeout';
import {getMaxZIndex} from './css';

import 'ios-overlay/style.css';

const debug = _debug('mwc:Controller');

const Controller = {
    nodes: {},
    isInitialized: false,
    ensureInitialized() {
        if (!this.isInitialized) {
            this.initialize();
        }
    },
    initialize() {
        debug('init Version: 1');
        this.nodes.ghostBox = $('<div id="mwc-ghost-box"/>')
            .appendTo('body')
            .css({
                display: 'none',
                border: '2px solid rgb(144, 67, 153)',
                borderRadius: '4px',
                position: 'absolute',
                zIndex: 9999,
                pointerEvents: 'none'
            });

        this.nodes.inputContainer = $('<div id="mwc-input-container"/>')
            .appendTo('body')
            .css({
                width: '1px',
                height: '1px',
                position: 'absolute',
                top: '-100px',
                left: '-100px'
            })

        this.nodes.input = $('<input type="text" id="mwc-input"/>')
            .appendTo(this.nodes.inputContainer);
    },
    targetStack: [],
    handlers: {},
    currentTarget() {
        return this.targetStack[this.targetStack.length - 1];
    },
    focusTarget: debounce(function() {
        const target = this.currentTarget();
        if (!target) {
            return;
        }
        const offset = target.offset();
        const style = {
            top: offset.top - 5,
            left: offset.left - 5,
            height: target.height() + 10,
            width: target.width() + 10
        };
        debug('Focusing on target:', target[0], style);
        this.nodes.ghostBox.animate(style, 'fast');
    }, 100),
    activate() {
        this._maxZ = getMaxZIndex();
        this.ensureInitialized();
        this.nodes.ghostBox
            .show()
            .css({
                zIndex: this._maxZ + 1
            });
        this._setupEventHandlers();
    },
    deactivate() {
        this.nodes.ghostBox.hide();
        this._removeEventHandlers();
        this.targetStack = [];
    },
    _setupEventHandlers() {
        this._setupKbdHandler();
        this._setupMouseHandler();
    },
    _removeEventHandlers() {
        this.nodes.input.off('blur keydown');
        $('body')
            .off('mousemove', this.handlers.mouseMove)
            .off('click', this.handlers.mouseClick);
        this.handlers = {};
    },
    _setupKbdHandler() {
        this.nodes.input.focus();
        this.nodes.input.on('blur', () => {
            this.nodes.input.focus();
        });
        this.nodes.input.on('keydown', (e) => {
            switch (keycode(e)) {
            case 'up':
                this.focusUp();
                break;
            case 'down':
                this.focusDown();
                break;
            case 'escape':
                this.deactivate();
                break;
            case 'enter':
                this.clipTarget();
                break;
            }
        })
    },
    _setupMouseHandler() {
        this.handlers.mouseMove = (e) => {
            this.targetStack = [$(e.target)];
            this.focusTarget();
        };
        this.handlers.mouseClick = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.clipTarget();
        };
        $('body')
            .on('mousemove', this.handlers.mouseMove)
            .on('click', this.handlers.mouseClick);
    },
    focusUp() {
        const target = this.currentTarget();
        if (!target || target[0].tagName.toLowerCase() === 'body') {
            return;
        }
        this.targetStack.push(target.parent());
        this.focusTarget();
    },
    focusDown() {
        if (this.targetStack.length <= 1) {
            return;
        }
        this.targetStack.pop();
        this.focusTarget();
    },
    _ensureOverlayAtTop() {
        $('.ios-overlay').css({
            zIndex: this._maxZ + 1
        });
    },
    async clipTarget() {
        const target = this.currentTarget();
        this.deactivate();
        if(!target) return;
        const notif = overlay({
            text: 'Clipping',
            spinner: getSpinner()
        });
        this._ensureOverlayAtTop();
        await timeout(100);
        await Clipper.clip(target);
        notif.update({
            icon: checkImg,
            text: 'Done',
        });
        this._ensureOverlayAtTop();
        await timeout(1000);
        notif.hide();
    }
};

export default Controller;
