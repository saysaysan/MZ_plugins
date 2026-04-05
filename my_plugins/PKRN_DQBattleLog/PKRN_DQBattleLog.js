// --------------------------------------------------------------------------
//
// [PKRN_DQBattleLog] Dragon Quest Style Battle Log
//
// Copyright (c) 2026 hatonekoe
// This software is released under the MIT License.
// https://opensource.org/license/mit
//
// --------------------------------------------------------------------------

/*:
 * @plugindesc Moves the battle log window to the bottom of the screen, like Dragon Quest.
 * @author hatonekoe
 * @target MZ
 *
 * @param MaxLines
 * @text Max Lines
 * @desc Number of lines the battle log window can display.
 * @default 3
 * @type number
 * @min 1
 * @max 10
 *
 * @param WindowOpacity
 * @text Window Opacity
 * @desc Opacity of the battle log window frame and background (0: fully transparent, 255: fully opaque).
 * @default 255
 * @type number
 * @min 0
 * @max 255
 *
 * @param BackPaintOpacity
 * @text Background Paint Opacity
 * @desc Opacity of the black background painted behind the text (0: transparent, 255: opaque).
 * @default 160
 * @type number
 * @min 0
 * @max 255
 *
 * @help PKRN_DQBattleLog.js
 *
 * This plugin moves the battle log window from the top to the bottom of the
 * battle screen, giving it a Dragon Quest-style appearance.
 *
 * The window occupies the same area as the command windows at the bottom.
 * During action execution, the log is visible. During command input,
 * the command windows render on top of the log area.
 */

/*:ja
 * @plugindesc バトルログウィンドウを画面下部に移動し、ドラクエ風の表示にします。
 * @author hatonekoe
 * @target MZ
 *
 * @param MaxLines
 * @text 最大行数
 * @desc バトルログウィンドウに表示できる最大行数。
 * @default 3
 * @type number
 * @min 1
 * @max 10
 *
 * @param WindowOpacity
 * @text ウィンドウ不透明度
 * @desc バトルログウィンドウの枠と背景の不透明度（0: 完全透明、255: 完全不透明）。
 * @default 255
 * @type number
 * @min 0
 * @max 255
 *
 * @param BackPaintOpacity
 * @text 背景塗り不透明度
 * @desc テキスト背後の黒背景の不透明度（0: 透明、255: 不透明）。
 * @default 160
 * @type number
 * @min 0
 * @max 255
 *
 * @help PKRN_DQBattleLog.js
 *
 * バトルログウィンドウを画面上部から下部に移動し、
 * ドラクエ風の表示にするプラグインです。
 *
 * ウィンドウはコマンドウィンドウと同じ画面下部エリアに配置されます。
 * 行動実行中はログが表示され、コマンド入力中はコマンドウィンドウが
 * ログの上に重なって表示されます（ドラクエ方式）。
 */

(() => {
  'use strict';

  const PLUGIN_NAME = 'PKRN_DQBattleLog';
  const params = PluginManager.parameters(PLUGIN_NAME);
  const maxLinesParam = Math.max(1, parseInt(params['MaxLines'] ?? 3, 10));
  const windowOpacityParam = Math.min(255, Math.max(0, parseInt(params['WindowOpacity'] ?? 255, 10)));
  const backPaintOpacityParam = Math.min(255, Math.max(0, parseInt(params['BackPaintOpacity'] ?? 160, 10)));

  // ログウィンドウをコマンドウィンドウと同じ下部エリアに配置する
  // 行動実行中はログが全面表示され、コマンド入力中はコマンドウィンドウが上に重なる
  Scene_Battle.prototype.logWindowRect = function() {
    const wh = this.windowAreaHeight();
    return new Rectangle(0, Graphics.boxHeight - wh, Graphics.boxWidth, wh);
  };

  /**
   * ウィンドウ初期化時に不透明度を設定してウィンドウ枠・背景を表示する
   */
  const _Window_BattleLog_initialize = Window_BattleLog.prototype.initialize;
  Window_BattleLog.prototype.initialize = function(rect) {
    _Window_BattleLog_initialize.call(this, rect);
    this.opacity = windowOpacityParam;
  };

  /**
   * 表示できる最大行数をプラグインパラメータから返す
   */
  Window_BattleLog.prototype.maxLines = function() {
    return maxLinesParam;
  };

  /**
   * テキスト背後の黒背景の不透明度をプラグインパラメータから返す
   */
  Window_BattleLog.prototype.backPaintOpacity = function() {
    return backPaintOpacityParam;
  };

  /**
   * 背景をウィンドウ内側の全領域に常時描画してウィンドウを空でも見やすくする
   */
  Window_BattleLog.prototype.backRect = function() {
    return new Rectangle(0, 0, this.innerWidth, this.innerHeight);
  };

})();
