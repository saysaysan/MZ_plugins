// --------------------------------------------------------------------------
//
// [PKRN_DQBattleStatus] Dragon Quest Style Battle Status
//
// Copyright (c) 2026 hatonekoe
// This software is released under the MIT License.
// https://opensource.org/license/mit
//
// --------------------------------------------------------------------------

/*:
 * @plugindesc Displays party status at the top of the battle screen in Dragon Quest style.
 * @author hatonekoe
 * @target MZ
 *
 * @param MaxPartySize
 * @text Max Party Size
 * @desc Maximum number of battle members. Also sets Game_Party.maxBattleMembers.
 * @default 4
 * @type number
 * @min 1
 * @max 5
 *
 * @param WindowOpacity
 * @text Window Opacity
 * @desc Opacity of the status window frame and background (0: transparent, 255: opaque).
 * @default 255
 * @type number
 * @min 0
 * @max 255
 *
 * @help PKRN_DQBattleStatus.js
 *
 * Replaces the standard battle status window with a Dragon Quest-style layout.
 * The window is placed at the top of the screen and shows each party member
 * in a vertical column:
 *
 *   Name
 *   HP [gauge]
 *   MP [gauge]
 *   TP [gauge]  (if TP display is enabled in System settings)
 *   Lv XX
 *
 * Up to 5 party members can be displayed side by side.
 *
 * To use 5 battle members, set "Max Party Size" to 5 and add a 5th member
 * to the party via event commands.
 */

/*:ja
 * @plugindesc パーティのステータスを画面上部にドラクエ風レイアウトで表示します。
 * @author hatonekoe
 * @target MZ
 *
 * @param MaxPartySize
 * @text 最大パーティ人数
 * @desc 戦闘に参加できる最大メンバー数。Game_Party.maxBattleMembers にも反映されます。
 * @default 4
 * @type number
 * @min 1
 * @max 5
 *
 * @param WindowOpacity
 * @text ウィンドウ不透明度
 * @desc ステータスウィンドウの枠と背景の不透明度（0: 完全透明、255: 完全不透明）。
 * @default 255
 * @type number
 * @min 0
 * @max 255
 *
 * @help PKRN_DQBattleStatus.js
 *
 * バトル画面のステータスウィンドウをドラクエ風レイアウトに変更します。
 * ウィンドウは画面上部に表示され、各パーティメンバーが縦並びのカラムで表示されます。
 *
 *   名前
 *   HP [ゲージ]
 *   MP [ゲージ]
 *   TP [ゲージ]  （システム設定でTP表示をONにした場合）
 *   Lv XX
 *
 * 最大5人まで横並びで表示できます。
 *
 * 5人パーティを使用するには「最大パーティ人数」を5に設定し、
 * イベントコマンドで5人目のメンバーをパーティに追加してください。
 */

(() => {
  'use strict';

  const PLUGIN_NAME = 'PKRN_DQBattleStatus';
  const params = PluginManager.parameters(PLUGIN_NAME);
  const maxPartySizeParam = Math.max(1, Math.min(5, parseInt(params['MaxPartySize'] ?? 4, 10)));
  const windowOpacityParam = Math.min(255, Math.max(0, parseInt(params['WindowOpacity'] ?? 255, 10)));

  // DQレイアウトで使う行高さ（Window_Base.lineHeight / Window_StatusBase.gaugeLineHeight の固定値）
  const LINE_HEIGHT = 36;
  const GAUGE_HEIGHT = 24;

  // -----------------------------------------------------------------------
  // Game_Party - 戦闘最大人数をパラメータに合わせる
  // -----------------------------------------------------------------------

  /**
   * 戦闘に参加できる最大メンバー数をプラグインパラメータから返す
   */
  Game_Party.prototype.maxBattleMembers = function() {
    return maxPartySizeParam;
  };

  // -----------------------------------------------------------------------
  // Scene_Battle - ステータスウィンドウを画面上部に配置する
  // -----------------------------------------------------------------------

  /**
   * ステータスウィンドウの矩形を画面上部・全幅で返す
   */
  Scene_Battle.prototype.statusWindowRect = function() {
    // Window_BattleStatus.updatePadding が padding=8 をセットするため上下合計16px
    const windowPadding = 8 * 2;
    const numGauges = $dataSystem.optDisplayTp ? 3 : 2;
    const contentH = LINE_HEIGHT * 2 + GAUGE_HEIGHT * numGauges;
    const wh = contentH + windowPadding;
    return new Rectangle(0, 0, Graphics.boxWidth, wh);
  };

  // -----------------------------------------------------------------------
  // Window_BattleStatus - DQスタイルの描画に切り替える
  // -----------------------------------------------------------------------

  /**
   * ウィンドウ初期化時に枠を表示し、不透明度をパラメータ値に設定する
   */
  const _Window_BattleStatus_initialize = Window_BattleStatus.prototype.initialize;
  Window_BattleStatus.prototype.initialize = function(rect) {
    _Window_BattleStatus_initialize.call(this, rect);
    this.frameVisible = true;
    this.opacity = windowOpacityParam;
  };

  /**
   * 列数を最大パーティ人数に合わせる
   */
  Window_BattleStatus.prototype.maxCols = function() {
    return maxPartySizeParam;
  };

  /**
   * DQスタイルでは顔グラを表示しない
   */
  Window_BattleStatus.prototype.drawItemImage = function(/* index */) {
    // 顔グラは描画しない
  };

  /**
   * 各アクターをDQスタイルの縦並びレイアウトで描画する
   * レイアウト: 名前 / HP / MP / TP（任意） / Lv
   */
  Window_BattleStatus.prototype.drawItemStatus = function(index) {
    const actor = this.actor(index);
    const rect = this.itemRectWithPadding(index);
    let y = rect.y;

    // 名前（HP危機時は赤色になる）
    this.drawActorName(actor, rect.x, y, rect.width);
    y += LINE_HEIGHT;

    // HP ゲージ
    this.placeGauge(actor, 'hp', rect.x, y);
    y += GAUGE_HEIGHT;

    // MP ゲージ
    this.placeGauge(actor, 'mp', rect.x, y);
    y += GAUGE_HEIGHT;

    // TP ゲージ（システム設定で「TPの表示」がONのときのみ）
    if ($dataSystem.optDisplayTp) {
      this.placeGauge(actor, 'tp', rect.x, y);
      y += GAUGE_HEIGHT;
    }

    // レベル（"Lv" ラベル + 数値をコンパクトに並べる）
    this.changeTextColor(ColorManager.systemColor());
    this.drawText(TextManager.levelA, rect.x, y, 36);
    this.resetTextColor();
    this.drawText(actor.level, rect.x + 36, y, rect.width - 36, 'left');
  };

})();
