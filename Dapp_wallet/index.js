//you cannot use require keyword but import keyword
import { ethers } from "./ethers.5.6.esm.min.js";
import { abi, contractAddress } from "./constrants.js";

const connectButton = document.getElementById("connectButton");
const fund1 = document.getElementById("fund");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");

withdrawButton.onclick = withdraw;
balanceButton.onclick = getBalance;
connectButton.onclick = connect; //connecting buttons to the frontend
fund1.onclick = fund;

async function connect() {
  //this is the connect function
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    document.getElementById("connectButton").innerHTML = "Connected";
  } else {
    document.getElementById("connectButton").innerHTML =
      "Please Install metamask";
  }
}

//getBalance function

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

//fund function
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`fund me with  ${ethAmount} ETH`);
  if (typeof window.ethereum !== "undefined") {
    //provider / connection to the blockchain
    //signer / wallet /someone with some gas
    //contract that we are interacting with
    // ^ ABI / Address
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); //this will return which ever wallet is connected with the provider
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      //listen for the tx to be mined
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`mining ${transactionResponse.hash}.........`);
  //listen for this transaction to finish
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(
        `completed with ${transactionReceipt.confirmations} confirmations`
      );
      resolve();
    });
  });
}

//withdraw function
async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    console.log("withdrawing......")
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(); //this will return which ever wallet is connected with the provider
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try{
     const transactionResponse = await contract.withdraw()
     await listenForTransactionMine(transactionResponse, provider)
    } catch (err) {
        console.log(err);
    }
  }
}
