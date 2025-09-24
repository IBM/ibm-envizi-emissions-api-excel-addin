============
Installation
============

-------------
Prerequisites
-------------

Before installing the add-in, ensure the following requirements are met:

- Microsoft Excel (Office 365 Online, Mac or Windows)
- Active internet connection
- API credentials (``apiKey``, ``tenantId``, ``orgId``), are available on the `Overview Dashboard <https://www.app.ibm.com/envizi/emissions-api-home/overview?cuiURL=%2Femissions-api-home%2Foverview>`_ after `sign up <https://www.ibm.com/account/reg/us-en/signup?formid=urx-53999>`_.

-------
Install 
-------

In order to use Envizi for Excel there are two options to install:

1. Download from the AppSource Store (coming soon)
2. Sideload a manifest.xml file

Microsoft AppSource Store
=========================

Coming soon.


Sideload
========

Download the Manifest File
--------------------------

The manifest file is available at the following location:

`manifest.xml <https://plugins.app.ibm.com/excel-addin/manifest.xml>`_

If your browser opens the file as an .xml file and displays text, select **File** -> **Save/Save Page As**, name the file **manifest.xml** and save to your machine.

The following sections contain instructions for sideloading the Add-in in different environments, please choose the one that is relevant:

1. Office 365 - Online
2. Mac
3. Windows

Office 365 - Online
-------------------

The simplest method to sideload is to use the Office 365 Online.

- Go to `Excel <https://excel.cloud.microsoft/>`_
- From the **Home** tab, click Add-ins
- Click **More Add-ins**
- Click **Upload My Add-in**
- Click **Browse**
- Find the **manifest.xml** you downloaded
- Click **Upload**

Mac
---

- Open `Finder`
- On the top menu bar, click `Go`
- From the drop down menu that appears, click `Go to folder`
- /Users/<username>/Library/Containers/com.microsoft.Excel/Data/Documents
   - <username> should be replaced with the name of your Mac user
- if the `wef` folder exists
   - otherwise right click and create a folder called `wef`
- click on the `wef` folder to enter it
- place your downloaded `manifest.xml` file in the `wef` folder

.. image:: _images/placing-wef-file.png
   :alt: Placing manifest file in Mac directory
   :align: center
   
After successfully placing the manifest file, you can see the add-in in the list of Developer Add-in section.

.. image:: _images/developer-add-in.png
   :alt: Developer Add-in in Excel
   :align: center
   
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

For more information please see the `Microsoft 365 Office Add-in Mac <https://learn.microsoft.com/en-us/office/dev/add-ins/testing/sideload-an-office-add-in-on-mac>`_ documentation for Mac.

Windows
-------

In the case of sideloading, the installation on a local Windows machine requires a network share to host and has a few more steps for configuration.

Please follow the `Microsoft 365 Office Add-in Windows <https://learn.microsoft.com/en-us/office/dev/add-ins/testing/create-a-network-shared-folder-catalog-for-task-pane-and-content-add-ins>`_ documentation.

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