import { UAParser } from "ua-parser-js";

const DeviceInfo = () => {
  // Create an instance of UAParser
  const parser = new UAParser();

  // Parse the User-Agent string
  const uaResult = parser.getResult();
  return uaResult;
  //   return (
  //     <div>
  //       <h2>User Device Information</h2>
  //       <p><strong>Browser:</strong> {uaResult.browser.name} {uaResult.browser.version}</p>
  //       <p><strong>Operating System:</strong> {uaResult.os.name} {}</p>
  //       <p><strong>Device Type:</strong> {uaResult.device.type || 'Unknown'}</p>
  //       <p><strong>Device Vendor:</strong> {uaResult.device.vendor || 'Unknown'}</p>
  //       <p><strong>Device Model:</strong> {uaResult.device.model || 'Unknown'}</p>
  //     </div>
  //   );
};

DeviceInfo.displayName = "DeviceInfo";
export default DeviceInfo;
