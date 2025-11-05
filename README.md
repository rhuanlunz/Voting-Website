# **Your Voting Platform 🚀**

**Create a simple and efficient voting platform with this open-source website.** This site provides a basic framework, allowing you to customize it for your specific elections. Get started building today!

Originally developed for a Science Fair at IFES – Campus Linhares, this project was created to replace the voting system based on Google Forms, which required users to provide their CPF.  

The project was initially developed and hosted on **Codebergg** before being migrated to **GitHub**.

**Inspired by Material Design 3.**


## Getting Started 💨 

Here's how to begin building your voting platform:

1. **Installation:** Install the required packages with `pip install -r requirements.txt` from your project folder.
    * For best results, create a virtual environment: `python -m .venv .venv` and then activate it:  `./.venv/bin/activate`.

2. **Run the Server:**  Start the development server using `python -m flask run`.


### Dependencies 🧰
 
* **Sass:** For compiling styles;
* **Flask:** The Python server;
* **qrcode:** Generates QR codes;
* **Pillow:** Style the QR Codes.

### Voting List 📝

The server relies on a `projects.json` file in the root of your `src` folder. This file needs to follow this structure:

```json
[
    {
        "title": "Project Title",
        "content": "Brief project description",
        "footer": "Short footer note"
    },
   ...
]
```


## Instructions & Notes 🙋‍♂️

* **Compile Styles:** Execute the script in the `scripts` folder to compile styles.
* **Generate QR Codes:** This requires a secure context due to the cryptography library being used.
