import "../styles/style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import texture from "../public/matcap-porcelain-white.jpg";

// DOM がパースされたことを検出するイベントを設定
window.addEventListener(
  "DOMContentLoaded",
  () => {
    // 制御クラスのインスタンスを生成
    const app = new App();
    // 初期化
    app.init();
    // 描画
    app.render();
  },
  false
);

/**
 * three.js クラスを定義
 */
class App {
  /**
   * カメラ定義のための定数
   */
  static get CAMERA_PARAM() {
    return {
      // fovy は Field of View Y のことで、縦方向の視野角を意味する
      fovy: 76,
      // 描画する空間のアスペクト比（縦横比）
      aspect: window.innerWidth / window.innerHeight,
      // 描画する空間のニアクリップ面（最近面）
      near: 0.1,
      // 描画する空間のファークリップ面（最遠面）
      far: 100.0,

      // カメラの位置
      x: 24.0,
      y: 24.0,
      z: 40.0,
      // カメラの中止点
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    };
  }
  /**
   * レンダラー定義のための定数
   */
  static get RENDERER_PARAM() {
    return {
      // レンダラーが背景をリセットする際に使われる背景色
      clearColor: 0x666666,
      // レンダラーが描画する領域の横幅
      width: window.innerWidth,
      // レンダラーが描画する領域の縦幅
      height: window.innerHeight,
    };
  }
  /**
   * ディレクショナルライト定義のための定数
   */
  static get DIRECTIONAL_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 1.0, // 光の強度
      x: 1.0, // 光の向きを表すベクトルの X 要素
      y: 1.0, // 光の向きを表すベクトルの Y 要素
      z: 1.0, // 光の向きを表すベクトルの Z 要素
    };
  }
  /**
   * アンビエントライト定義のための定数
   */
  static get AMBIENT_LIGHT_PARAM() {
    return {
      color: 0xffffff, // 光の色
      intensity: 0.2, // 光の強度
    };
  }
  /**
   * マテリアル定義のための定数
   */
  static get MATERIAL_PARAM() {
    return {
      color: 0xffffff, // マテリアルの基本色
      matcap: new THREE.TextureLoader().load(texture), // テクスチャー用の画像を設定
    };
  }
  static get MATERIAL_PARAM2() {
    return {
      color: 0xffffff, // マテリアルの基本色
      side: THREE.DoubleSide,
    };
  }

  /**
   * コンストラクタ
   * @constructor
   */
  constructor() {
    this.renderer; // レンダラ
    this.scene; // シーン
    this.camera; // カメラ
    this.directionalLight; // ディレクショナルライト
    this.ambientLight; // アンビエントライト
    this.material; // マテリアル
    this.torusGeometry; // トーラスジオメトリ
    this.torusArray; // トーラスメッシュの配列
    this.controls; // オービットコントロール
    this.axesHelper; // 軸ヘルパー
    this.fanBlades; //扇風機の羽の配列
    this.isDown = false; // キーの押下状態を保持するフラグ
    this.group; //グループ
    this.time = 0; // 時間の初期値
    // 再帰呼び出しのための this 固定
    this.render = this.render.bind(this);

    // キーの押下や離す操作を検出できるようにする
    window.addEventListener(
      "keydown",
      (keyEvent) => {
        switch (keyEvent.key) {
          case " ":
            this.isDown = true;
            break;
          default:
        }
      },
      false
    );
    window.addEventListener(
      "keyup",
      () => {
        this.isDown = false;
      },
      false
    );

    // リサイズイベント
    window.addEventListener(
      "resize",
      () => {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
      },
      false
    );
  }

  /**
   * 初期化処理
   */
  init() {
    // レンダラー
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor(new THREE.Color(App.RENDERER_PARAM.clearColor));
    this.renderer.setSize(App.RENDERER_PARAM.width, App.RENDERER_PARAM.height);
    const wrapper = document.querySelector("#webgl");
    wrapper.appendChild(this.renderer.domElement);

    // シーン
    this.scene = new THREE.Scene();

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      App.CAMERA_PARAM.fovy,
      App.CAMERA_PARAM.aspect,
      App.CAMERA_PARAM.near,
      App.CAMERA_PARAM.far
    );
    this.camera.position.set(
      App.CAMERA_PARAM.x,
      App.CAMERA_PARAM.y,
      App.CAMERA_PARAM.z
    );
    this.camera.lookAt(App.CAMERA_PARAM.lookAt);
    this.camera.position.z = 20;
    // ディレクショナルライト（平行光源）
    this.directionalLight = new THREE.DirectionalLight(
      App.DIRECTIONAL_LIGHT_PARAM.color,
      App.DIRECTIONAL_LIGHT_PARAM.intensity
    );
    this.directionalLight.position.set(
      App.DIRECTIONAL_LIGHT_PARAM.x,
      App.DIRECTIONAL_LIGHT_PARAM.y,
      App.DIRECTIONAL_LIGHT_PARAM.z
    );
    this.scene.add(this.directionalLight);

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(
      App.AMBIENT_LIGHT_PARAM.color,
      App.AMBIENT_LIGHT_PARAM.intensity
    );
    this.scene.add(this.ambientLight);

    // マテリアル
    this.material = new THREE.MeshMatcapMaterial(App.MATERIAL_PARAM);
    this.material2 = new THREE.MeshMatcapMaterial(App.MATERIAL_PARAM2);
    this.geometry = new THREE.CircleGeometry(8, 4, 0, 1);

    // グループ
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.fanBlades = [];
    const radius = 6; // 半径

    // 扇風機のブレードの作成
    for (let i = 0; i < radius; i++) {
      const blade = new THREE.Mesh(this.geometry, this.material2);
      const angle = (i * Math.PI * 2) / radius; // 円周上に均等に配置するための角度計算
      blade.rotation.z = angle + Math.PI * radius; // ブレードの向きを調整
      // this.scene.add(blade);
      this.group.add(blade);

      this.fanBlades.push(blade);
    }

    const torusGeometry = new THREE.TorusGeometry(10, 1.485, 2, 106);
    const torus = new THREE.Mesh(torusGeometry, this.material);
    // this.scene.add(torus);
    this.group.add(torus);

    // 芯を追加
    const cylinderGeometry = new THREE.CylinderGeometry(4, 4, 20, 20);
    const cylinder = new THREE.Mesh(cylinderGeometry, this.material);
    cylinder.rotation.x = Math.PI / 2;
    cylinder.position.z = -10;

    // this.scene.add(cylinder);
    this.group.add(cylinder);

    //円柱を追加
    const cylinderGeometry02 = new THREE.CylinderGeometry(2, 3, 30, 10);
    const cylinder02 = new THREE.Mesh(cylinderGeometry02, this.material);
    cylinder02.position.z = -7.5;
    cylinder02.position.y = -6;

    this.scene.add(cylinder02);
    // this.group.add(cylinder02);

    const cylinderGeometry03 = new THREE.CylinderGeometry(10, 14, 1, 32);
    const cylinder03 = new THREE.Mesh(cylinderGeometry03, this.material);
    cylinder03.position.z = -7.5;
    cylinder03.position.y = -21;
    this.scene.add(cylinder03);

    //グループの位置を修正
    this.group.position.y = 10;

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    // ヘルパー
    const axesBarLength = 5.0;
    this.axesHelper = new THREE.AxesHelper(axesBarLength);
    this.axesHelper.visible = false;
    this.scene.add(this.axesHelper);
  }

  /**
   * 描画処理
   */

  render() {
    // 恒常ループの設定
    requestAnimationFrame(this.render);

    // コントロールを更新
    this.controls.update();

    const rotationSpeed = 0.02; // 回転速度
    this.fanBlades.forEach(function (blade) {
      blade.rotation.z += rotationSpeed;
    });

    this.time += 0.01;
    const value = Math.sin(this.time);
    // 0.5から-0.5の範囲に変換
    const normalizedValue = (value + 1) * 0.3 - 0.3;
    this.group.rotation.y = normalizedValue;

    // レンダラーで描画
    this.renderer.render(this.scene, this.camera);
  }
}
