#!/bin/bash

# Array of library names
libraries=("core" "react" "ui" "prisma-adapter")

# Loop through each library
for lib in "${libraries[@]}"
do
    echo "Publishing $lib..."
    
    # Change to the library's directory
    cd "dist/libs/$lib" || exit
    
    # Publish the package
    npm publish --access public
    
    # Check if publish was successful
    if [ $? -eq 0 ]; then
        echo "$lib published successfully"
    else
        echo "Failed to publish $lib"
    fi
    
    # Return to the original directory
    cd - > /dev/null
    
    echo "-------------------"
done

echo "All libraries have been processed"