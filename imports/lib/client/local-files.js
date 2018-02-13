export class LocalFiles {
  static getURL(stringData) {
    return URL.createObjectURL(new Blob([stringData]));
  }
}
