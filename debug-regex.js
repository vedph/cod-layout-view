// Test the regex patterns
const formula = "250 × 160 = 30 / 5 [170 / 5] 40 × 15 [3 / 50 / 5] 15";
console.log("Full formula:", formula);

const sectMatch = /^(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*=\s*([^×x]+)[×x](.+)$/i.exec(formula);
if (sectMatch) {
  console.log("Section match:");
  console.log("  Height:", sectMatch[1]);
  console.log("  Width:", sectMatch[2]);
  console.log("  Height details:", sectMatch[3]);
  console.log("  Width details:", sectMatch[4]);
  
  // Test height parsing
  const heightDetails = sectMatch[3].trim();
  console.log("\nHeight details to parse:", heightDetails);
  const heightRegex = /^(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?\[(?:(\d+(?:\.\d+)?)\/)?(\d+(?:\.\d+)?)(?:\/(\d+(?:\.\d+)?))?\](?:(\d+(?:\.\d+)?)\/)?(\d+(?:\.\d+)?)$/;
  const heightMatch = heightRegex.exec(heightDetails.replace(/\s+/g, ''));
  if (heightMatch) {
    console.log("Height match groups:", heightMatch.slice(1));
  } else {
    console.log("Height regex failed");
  }
  
  // Test width parsing
  const widthDetails = sectMatch[4].trim();
  console.log("\nWidth details to parse:", widthDetails);
  console.log("Width details cleaned:", widthDetails.replace(/\s+/g, ''));
  
  const cleanWidth = widthDetails.replace(/\s+/g, '');
  const mlMatch = /^(\d+(?:\.\d+)?)/.exec(cleanWidth);
  const mrMatch = /(\d+(?:\.\d+)?)$/.exec(cleanWidth);
  console.log("Margin left match:", mlMatch ? mlMatch[1] : "none");
  console.log("Margin right match:", mrMatch ? mrMatch[1] : "none");
  
  if (mlMatch && mrMatch) {
    const mlLength = mlMatch[0].length;
    const mrStart = mrMatch.index;
    let content = cleanWidth.substring(mlLength, mrStart);
    console.log("Content between margins:", content);
    
    if (content.startsWith('[') && content.endsWith(']')) {
      content = content.substring(1, content.length - 1);
      console.log("Content without brackets:", content);
    }
  }
} else {
  console.log("Section regex failed");
}
