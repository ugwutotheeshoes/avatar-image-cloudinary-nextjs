"use client"
import Loader from "@/components/Loader";
import Image from "next/image";
import { useState } from "react";
import { FaRegCopy, FaRegPaperPlane } from "react-icons/fa";
import CopyToClipboard from "react-copy-to-clipboard";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [img, setImg] = useState<string>("");
  const [characters, setCharacters] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
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
        body: JSON.stringify({ url, characters, value }), // send the string as a JSON object
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
  const handleCharacters = () => {
    const char = firstName.trim().charAt(0) + lastName.trim().charAt(0)
    setCharacters(char)
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
        handleCharacters()
        setValue("")
        // setLoading(false)
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
        Avatar image manager
      </h1>
      {url &&
        <div className="flex flex-col items-center justify-center">
          <div className="relative flex justify-center items-center ">
          <Image src={url} onLoadingComplete={() => setLoading(false)} width={192} height={192} alt="ai image" className="object-cover rounded-full blur-[2px]" />
            <h1 className="text-6xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center capitalize">{characters}</h1>
            {/* <img src="/a-siamese-cat.png" alt="cat" className="w-48 h-48 object-cover blur-[2px]" /> */}
          </div>
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
      <form>
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="First Name" name="value" onChange={(e) => { setFirstName(e.target.value) }}
            className="bg-gray-100 placeholder:text-gray-400 disabled:cursor-not-allowed border border-gray-500 text-gray-900 text-sm rounded-lg block p-3.5 mr-2 w-[290px]"
            required
          />
          <input type="text" placeholder="Last Name" name="value" onChange={(e) => { setLastName(e.target.value) }}
            className="bg-gray-100 placeholder:text-gray-400 disabled:cursor-not-allowed border border-gray-500 text-gray-900 text-sm rounded-lg block p-3.5 mr-2 w-[290px]"
            required
          />
        </div>
        <div className="flex justify-between items-center mt-2">
          <input type="text" placeholder="Enter an image prompt" name="value" onChange={(e) => { setValue(e.target.value) }}
            className="bg-gray-100 placeholder:text-gray-400 disabled:cursor-not-allowed border border-gray-500 text-gray-900 text-sm rounded-lg block p-3.5 mr-2 w-[480px]"
            required
          />
          <button className="text-white bg-blue-700 font-medium rounded-lg text-sm transition-all sm:w-auto px-5 py-3 text-center" onClick={handlePrompt}>
            {loading ? <Loader /> : "Send"}
          </button>
        </div>
      </form>
    </main>
  );
}
