
// Function to arrange the comments and child entities in order of their creation time.
export const sortAndFilterChildren = (entity, displayChildren, onlyShowBookmarked) => {
    let combinedArray = [];
    if (entity !== null && displayChildren !== null) {
        combinedArray = [...entity.comments, ...displayChildren];
        combinedArray.sort((a, b) => {
            const timeA = a.created ? new Date(a.created) : new Date(a.start_time);
            const timeB = b.created ? new Date(b.created) : new Date(b.start_time);
            return timeA - timeB;
        });

        if (onlyShowBookmarked) {
            combinedArray = combinedArray.filter(item => item.com_type || item.bookmarked);
        }
    }
    return combinedArray
};


export async function getEntity(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}`);
    return await res.json();
}


export async function submitContentBlockEdition(entID, user, contentBlock, newContent) {

    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/` + entID + "/" + contentBlock.ID + "?HTML=True&username=" + user, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}

export async function submitNewContentBlock(entID, user, newContent) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/` + entID + "?HTML=True" + "&username=" + user, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}

export async function createEntity(name, user, type, parent) {
    const newEntity = {
        name, user, type, parent
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newEntity)
    });

    return response.status === 201;
}


export async function deleteEntity(entID) {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${entID}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },

    });

    return response.status === 201;
}


export async function createLibrary(name, user) {
    const newLibrary = {
        name, user
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/add_library`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newLibrary)
        });

        if (response.status === 201) {
            return True
        } else {
            const errorDetails = await response.json();
            console.log("Error creating new Library", errorDetails);
            return errorDetails.detail;
        }

    } catch (error) {
        console.error("Error creating new Library", error);
        return error.message;
    }
}


export async function getUsers() {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/properties/users`);

    if (response.status === 201) {
        const data = await response.json();
        return JSON.parse(data);
    } else {
        return null;
    }
}

export async function setUserColor(email, color) {
    // Ensure the color is properly encoded for the URL
    const encodedColor = encodeURIComponent(color);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/properties/users/${email}?color=` + encodedColor, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
    });

    if (response.status === 201) {
        return true;
    } else {
        return null;
    }

}

export function getNameInitials(name) {
    return name.split(' ').map(name => name[0]).join('').toUpperCase()
}


export function getContrastTextColor(bgColor){
    // Taken from: https://stackoverflow.com/questions/3942878/how-to-decide-font-color-in-white-or-black-depending-on-background-color
    let color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    let r = parseInt(color.substring(0, 2), 16); // hexToR
    let g = parseInt(color.substring(2, 4), 16); // hexToG
    let b = parseInt(color.substring(4, 6), 16); // hexToB
    let uicolors = [r / 255, g / 255, b / 255];
    let c = uicolors.map((col) => {
        if (col <= 0.03928) {
        return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    let L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return L <= 0.179 ? 'white' : 'black';
    
}



