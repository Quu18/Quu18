/**
 * VRButton class
 */
class VRButton {

    constructor(renderer, options) {
        this.renderer = renderer;
        if (options !== undefined) {
            this.onSessionStart = options.onSessionStart;
            this.onSessionEnd = options.onSessionEnd;
            this.sessionInit = options.sessionInit;
            this.sessionMode = (options.inline !== undefined && options.inline) ? 'inline' : 'immersive-vr';
        } else {
            this.sessionMode = 'immersive-vr';
        }

        if (this.sessionInit === undefined) this.sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] };

        if ('xr' in navigator) {

            const button = document.createElement('button');
            button.style.display = 'none';

            navigator.xr.isSessionSupported(this.sessionMode).then((supported) => {

                supported ? this.showEnterVR(button) : this.showWebXRNotFound(button);
                if (options && options.vrStatus) options.vrStatus(supported);

            });

            document.body.appendChild(button);

        } else {

            const message = document.createElement('a');

            if (window.isSecureContext === false) {

                message.href = document.location.href.replace(/^http:/, 'https:');
                message.innerHTML = 'WEBXR NEEDS HTTPS';

            } else {

                message.href = 'https://immersiveweb.dev/';
                message.innerHTML = 'WEBXR NOT AVAILABLE';

            }

            message.style.left = '0px';
            message.style.width = '100%';
            message.style.textDecoration = 'none';

            this.stylizeElement(message, false);
            message.style.bottom = '0px';
            message.style.opacity = '1';

            document.body.appendChild(message);

            if (options.vrStatus) options.vrStatus(false);

        }

    }

    showEnterVR(button) {

        let currentSession = null;
        const self = this;

        this.stylizeElement(button, true, 40, true);  // Increased font size to 40

        function onSessionStarted(session) {

            session.addEventListener('end', onSessionEnded);

            self.renderer.xr.setSession(session);
            self.stylizeElement(button, false, 20, true);  // Adjusted font size to 20

            button.textContent = 'EXIT VR';

            currentSession = session;

            if (self.onSessionStart !== undefined) self.onSessionStart();

        }

        function onSessionEnded() {

            currentSession.removeEventListener('end', onSessionEnded);

            self.stylizeElement(button, true, 20, true);  // Adjusted font size to 20
            button.textContent = 'ENTER VR';

            currentSession = null;

            if (self.onSessionEnd !== undefined) self.onSessionEnd();

        }

        button.style.display = '';
        button.style.width = '150px';  // Increased width
        button.style.height = '70px';  // Increased height
        button.style.cursor = 'pointer';
        button.innerHTML = '<i class="fas fa-vr-cardboard"></i>';

        // Position the button in the center
        button.style.position = 'absolute';
        button.style.top = '50%';
        button.style.left = '50%';
        button.style.transform = 'translate(-50%, -50%)';

        button.onmouseenter = function () {

            button.style.fontSize = '20px';
            button.textContent = (currentSession === null) ? 'ENTER VR' : 'EXIT VR';
            button.style.opacity = '1.0';

        };

        button.onmouseleave = function () {

            button.style.fontSize = '40px';
            button.innerHTML = '<i class="fas fa-vr-cardboard"></i>';
            button.style.opacity = '0.5';

        };

        button.onclick = function () {

            if (currentSession === null) {

                navigator.xr.requestSession(self.sessionMode, self.sessionInit).then(onSessionStarted);

            } else {

                currentSession.end();

            }

        };

    }

    disableButton(button) {

        button.style.cursor = 'auto';
        button.style.opacity = '0.5';

        button.onmouseenter = null;
        button.onmouseleave = null;

        button.onclick = null;

    }

    showWebXRNotFound(button) {
        this.stylizeElement(button, false);

        this.disableButton(button);

        button.style.display = '';
        button.style.width = '100%';
        button.style.right = '0px';
        button.style.bottom = '0px';
        button.style.border = '';
        button.style.opacity = '1';
        button.style.fontSize = '13px';
        button.textContent = 'VR NOT SUPPORTED';

    }

    stylizeElement(element, active = true, fontSize = 20, ignorePadding = false) {  // Adjusted font size to 20

        element.style.position = 'absolute';
        element.style.top = '50%';
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        if (!ignorePadding) element.style.padding = '20px 10px';  // Increased padding
        element.style.border = '1px solid #fff';
        element.style.borderRadius = '4px';
        element.style.background = (active) ? 'rgba(180,20,20,1)' : 'rgba(20,150,80,1)'; // Changed to red when active
        element.style.color = '#fff';
        element.style.font = `normal ${fontSize}px sans-serif`;
        element.style.textAlign = 'center';
        element.style.opacity = '0.5';
        element.style.outline = 'none';
        element.style.zIndex = '999';

    }

};

export { VRButton };
