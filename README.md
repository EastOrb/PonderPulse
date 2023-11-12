# PonderPulse

PonderPulse is a social platform built on the Internet Computer Protocol (ICP), allowing users/authors to create, update, and interact with posts in a collaborative environment.

## Table of Contents

- [PonderPulse](#ponderpulse)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
  - [Usage](#usage)
  - [Deployed Canister link](#deployed-canister-link)

## Features

- **Create Post:** Users can create new posts with a title, content, and an optional image.
- **Update Post:** Authors can update their own posts, modifying the title, content, and image.
- **Delete Post:** Authors can delete their own posts.
- **Comment on Posts:** Users can add comments to existing posts.
- **Like Posts:** Users can like posts, and the number of likes is tracked.
- **Get Liked Posts:** Users can retrieve a list of posts they have liked.
- **User Authentication:** Caller validation ensures that only authorized users can perform certain actions.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Internet Computer Protocol (ICP) environment
- Node.js and npm
- Azle package

### Installation

1. Clone the repository:

```bash
   git clone https://github.com/Abdulazeez41/PonderPulse.git
```

2. Install dependencies:

```bash
   cd PonderPulse
   npm install
```

## Usage

To use PonderPulse, follow these steps:

1. Start the ICP environment.

2. Deploy the canister code.

3. Access the API endpoints for creating, updating, and interacting with posts.

   Example API endpoint: `http://127.0.0.1:4943/?canisterId=bd3sg-teaaa-aaaaa-qaaba-xxxx-xxxx-xxxx-xxxx-cai`

## Deployed Canister link

- [Ponder Pulse](http://127.0.0.1:4943/?canisterId=bd3sg-teaaa-aaaaa-qaaba-cai&id=avqkn-guaaa-aaaaa-qaaea-cai)
