# XR Gallery

An interactive web-based XR gallery for exploring, viewing, creating, uploading, and managing digital artwork in an immersive environment.

The project combines a virtual art gallery with a browser-based Drawing Studio and a backend API for dynamically storing and retrieving artwork. It is designed to work as a standard web experience today, with XR-device compatibility as a next step.

---

## Overview

XR Gallery is an interactive digital gallery that allows users to explore artwork in a 3D environment while also creating and managing their own artwork.

The project combines:

- Interactive virtual art gallery
- Browser-based Drawing Studio
- WebXR support for immersive experiences
- Interactive 3D/XR drawing
- Artwork uploading
- Artwork deletion
- Dynamic artwork loading through a backend API
- Persistent artwork storage through the backend
- Browser-based interaction
- XR-device compatibility as a next development step

The goal is to explore how digital art galleries can move beyond a traditional 2D webpage and become interactive, spatial experiences.

---

# Interactive Art Gallery

The main experience is a 3D virtual art gallery built with Three.js.

Artwork is dynamically loaded from the backend rather than being hard-coded into the gallery. This means new artwork can be uploaded and displayed without manually modifying the gallery itself.

The gallery supports:

- Dynamic artwork loading
- Multiple artwork pieces
- Artwork displayed within a 3D environment
- Interactive artwork selection
- Artwork management
- Artwork deletion
- Persistent artwork storage

The gallery currently supports up to the configured gallery capacity at a time, with artwork retrieved through the backend API.

---

# Drawing Studio

The project includes a built-in **Drawing Studio** for creating artwork.

Users can create artwork directly within the browser and then add their creations to the gallery.

The Drawing Studio is designed to support both traditional browser interaction and future immersive XR interaction.

### Current capabilities

- Browser-based drawing
- Canvas-based artwork creation
- Drawing controls
- Creating custom artwork
- Adding created artwork to the gallery

### Future XR capabilities

The project is also being developed toward interactive 3D/XR drawing, allowing users to create artwork within an immersive environment rather than only on a traditional 2D canvas.

---

# XR Development

XR compatibility is the next major step of the project.

The application is being built with WebXR-compatible technologies so that the gallery can eventually be experienced through compatible XR devices.

The current version primarily focuses on the browser-based experience and the underlying systems needed to support an XR version.

Future XR development will focus on:

- XR device support
- Immersive gallery exploration
- 3D/XR drawing
- Hand and/or controller interaction
- Spatial interaction with artwork
- Immersive artwork creation

---

# Artwork Backend

The gallery uses a separate Node.js/Express backend to manage artwork.

The backend provides API endpoints for:

- Retrieving artwork
- Loading individual artwork images
- Uploading artwork
- Deleting artwork
- Checking backend health

This allows the frontend gallery to dynamically communicate with the artwork collection.
