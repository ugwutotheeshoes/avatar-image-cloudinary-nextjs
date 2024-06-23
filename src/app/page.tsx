"use client"
import Loader from "@/components/Loader";
import Image from "next/image";
import { useState } from "react";
import { FaRegCopy, FaRegPaperPlane } from "react-icons/fa";
import CopyToClipboard from "react-copy-to-clipboard";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [img, setImg] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean | undefined>(false);
  const [save, setSave] = useState<boolean | undefined>(false);
  const [copyStatus, setCopyStatus] = useState(false); // To indicate if the text was copied

  const saveImage = async (e: any) => {
    e.preventDefault()
    setSave(true)
    try {
      const response = await fetch('/api/cloudinary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }), // send the string as a JSON object
      });
      // Handle success, such as updating UI or showing a success message
      if (response.ok) {
        const data = await response.json();
        setImg(data.uploadResponse)
        setSave(false)
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error sending prompt:', error);
    }
  }
  const handlePrompt = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/dalle3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: value }), // send the string as a JSON object
      });
      // Handle success, such as updating UI or showing a success message
      if (response.ok) {
        const data = await response.json();
        setUrl(data.image_url)
        setValue("")
      }
    } catch (error) {
      // Handle network errors or other exceptions
      console.error('Error uploading file:', error);
    }
  };
  const onCopyText = () => {
    setCopyStatus(true);
    setTimeout(() => setCopyStatus(false), 2000); // Reset status after 2 seconds
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="relative text-3xl font-semibold capitalize ">
        AI image manager
      </h1>
        {url &&
          <div className="flex flex-col items-center justify-center">
            <Image src={url} onLoadingComplete={() => setLoading(false)} width={500} height={500} alt="ai image" />
            {!loading &&
              <button type="submit" onClick={saveImage} className="flex justify-center text-white border bg-blue-700 hover:bg-blue-800 font-medium relative rounded-lg text-xs px-2.5 py-2.5 text-center mt-3">
                {save ? <Loader /> : "Save image"}
              </button>
            }
          </div>
        }
        {img ?
          <div>
            <div className=" flex justify-center items-center gap-2 mt-2">
              <p className="text-sm font-semibold">Image URL:</p>
              <input id="clipboard" value={img} className="bg-gray-100 border border-gray-500 text-gray-900 text-sm rounded-lg p-1.5 w-[340px]" />
              <CopyToClipboard text={img} onCopy={onCopyText}>
                <button className="text-sm font-semibold text-blue-500">
                  <FaRegCopy />
                </button>
              </CopyToClipboard>
            </div>
            {copyStatus && <p className="text-center">Text copied to clipboard!</p>}
          </div>
          : null
        }
        <div className="flex items-center justify-between">
          <input type="text" placeholder="Enter an image prompt" name="value" onChange={(e) => { setValue(e.target.value) }}
            className="bg-gray-100 placeholder:text-gray-400 disabled:cursor-not-allowed border border-gray-500 text-gray-900 text-sm rounded-lg block p-3.5 mr-2 w-[600px]"
            required
          />
          <button className="text-blue-700 relative right-[3.5rem] font-medium p-5 rounded-lg text-sm transition-all sm:w-auto px-5 py-2.5 text-center" onClick={handlePrompt}
            disabled={save}>
            {loading ? <Loader /> : <FaRegPaperPlane />}
          </button>
        </div>
    </main>
  );
}
