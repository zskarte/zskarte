declare module 'shpjs' {
  function shp(source: Buffer | ArrayBuffer | Uint8Array | string): Promise<any>;

  namespace shp {
    function parseZip(buffer: Buffer | ArrayBuffer | Uint8Array): Promise<any>;
    function parseShp(buffer: Buffer | ArrayBuffer | Uint8Array, prj?: string): Promise<any>;
  }

  export default shp;
}
