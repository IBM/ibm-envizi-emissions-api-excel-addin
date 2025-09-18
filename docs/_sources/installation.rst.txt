============
Installation
============

Prerequisites
-------------

Before installing the add-in, ensure the following requirements are met:

- Microsoft Excel (Mac, Windows, or Web)
- Active internet connection
- API credentials (``apiKey``, ``tenantId``, ``orgId``), are available on the Emissions API Overview page after sign up

Download the Manifest File
--------------------------

The manifest file is available on GitHub:

`IBM Envizi Emissions API Excel Add-in Repository <https://github.com/IBM/ibm-envizi-emissions-api-excel-addin>`_

Steps:

1. Open the repository.
2. Download the **manifest.xml** file.
3. You can either:
   
   - Place the ``manifest.xml`` file in the appropriate folder (Mac only, see below)
   - Side-load the add-in into Excel
   
Placing the Manifest File (Mac only)
------------------------------------

For macOS, place the ``manifest.xml`` file in the following path:

``/Users/<username>/Library/Containers/com.microsoft.Excel/Data/Documents/wef/``

**Notes:**
- The Library folder is hidden by default on macOS. To reveal it :

   - Open Finder.
   - In the top menu, click Go → Go to Folder…
   - Enter ~/Library and press Enter.

If the ``wef`` folder does not exist under the above path, create it manually:

   - Navigate to ```/Users/<username>/Library/Containers/com.microsoft.Excel/Data/Documents/```
   - Create a new folder named wef.
   - Place the manifest.xml file inside this folder.

.. image:: _images/placing-wef-file.png
   :alt: Placing manifest file in Mac directory
   :align: center


After successfully placing the manifest file, you can see the add-in in the list of Developer Add-in section.

.. image:: _images/developer-add-in.png
   :alt: Developer Add-in in Excel
   :align: center


Installing the Add-in (Side-loading)
------------------------------------

1. Open Microsoft Excel.
2. Navigate to **Home → Add-ins → More Add-ins**.

   .. image:: _images/add-in.png
      :alt: Add-ins menu in Excel
      :align: center

3. Click **Upload My Add-in**.

   .. image:: _images/my-add-in.png
      :alt: Upload My Add-in option
      :align: center

4. Select the downloaded ``manifest.xml`` file.

   .. image:: _images/upload.png
      :alt: Uploading the manifest file
      :align: center

5. Confirm the installation.
   A new **Envizi Add-in** button will appear in the Excel ribbon (typically under the **Home** tab).

   .. image:: _images/installed.png
      :alt: Installed add-in in Excel ribbon
      :align: center

Calculation Mode Tip
--------------------

After installation, change the calculation mode to **Manual** to prevent unnecessary API calls:

1. Go to **Formulas → Calculation Options**.
2. Select **Manual**.

.. image:: _images/calculation.png
   :alt: Manual calculation mode in Excel
   :align: center

3. To recalculate a formula in manual calculation mode either press **F9** or do the following:
   
   - Select the cell
   - Press F2 (this puts the cell into edit mode)
   - Press Enter