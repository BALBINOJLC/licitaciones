import React, { useEffect, useState } from "react";

interface Props {
  blobUrl: string;
  height?: string | number;
}

const PDFIframeViewer: React.FC<Props> = ({ blobUrl, height = "500px" }) => {
  const [url, setUrl] = useState(blobUrl);

  useEffect(() => {
    setUrl(blobUrl);
    return () => {
      // cleanup object URL if provided
      if (blobUrl.startsWith("blob:")) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  return (
    <iframe
      title="PDF editable"
      src={url}
      style={{ width: "100%", height, border: "1px solid #d1d5db" }}
    ></iframe>
  );
};

export default PDFIframeViewer;
