# Holo-Eyes-On-Us
In this file there are the first steps to configurate the Hololens with Unity.

<< ON COMPUTER >>
	Create and open a new 3D project
	Put the black background to the main room
	Edit the project as desired (optional)
	Go to File > Build Settings
		select Universal Windows Platform
		put Architercture = ARM 64-bit
		press Switch Platform and close Unity
	
	Open MixedRealityFeatureTool
	Press Discover FEATURES
	Choose 'Mixed Reality Toolkit > Mixed Reality Toolkit Examples, Mixed Reality Toolkit Extenions, Mixed Reality Toolkit Foundation and Platform Support > Mixed Reality OpenXR Plugin'
	Press in order Get Features, Validate, Import and Approve
	
	Reopen the Unity project
	On the screen 'MRTK Prrject configuration'...
		Select Unity OpenXR puglin
		Open XR Plug-in Management on the Winzoz symbol
			Press OpenXR and then Microsoft hololens feature group
		Open XR Plug-in Management > OpenXR on Winzoz symbol
			Change Depth Submission Mode to Depth-16-bit
			Press the + button in the middle of the tab
				Choose Eye Gaze Interaction Group, Microsoft Hand Interaction Profile, and Microsoft Motion Controller Profile
				At the bottom, check the box Holographic Remoting remote app
		Open XR Plug-in Management > Project Validation
			press and run Fix All
	Back to MRTK Project configuration
	Press Apply Settings, Next, Apply, Next and Import TMP Essentials
	Select the MixedReality Toolkit object and enter the Inspector entry on the right
		Press Clone
	
<< ON THE VIEWER >>
	After turning it on, Enter the Microsoft Store
	Install and open 'Holographic Remoting Player'
	Read the ip

<< ON COMPUTER >>
	<< MODE 1 >>
		From the menu press Mixed Reality > Remoting > Holographdd to Scene and Configure
		Write the IP read by the viewer in the Remote Host Name
	<< MODE 2 >>
		Open entry File > Build Settings
			Change Visual Studio Version
			Press Build
		Open the . sln file with Visual Studio
		Set Degub, ARM64 and Remote Computer
    Run without debugging (Debug > Run without debugging)
		
		<< ON THE VIEWER >>
			Select the App entry on the right and run the one named == {Project name}
