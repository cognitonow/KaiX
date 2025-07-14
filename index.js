import { GoogleGenerativeAI } from "@google/generative-ai";

document.addEventListener('DOMContentLoaded', () => {

    // --- App Controller ---
    const App = {
        // --- State ---
        isFirstInteraction: true,
        chatHistory: [],
        recognition: null,
        micPermissionState: 'prompt', // 'prompt', 'granted', or 'denied'
        allProjects: [],
        carousel: {
            animationFrame: null,
            isPaused: false,
            speed: 0.5,
        },

        // --- Elements ---
        pages: document.querySelectorAll('main'),
        nav: {
            home: [document.getElementById('nav-home-main'), document.getElementById('nav-home-logo')],
            works: document.getElementById('nav-works'),
            timeline: document.getElementById('nav-timeline'),
            faq: document.getElementById('nav-faq'),
            contact: document.getElementById('nav-contact'),
        },
        settings: {
            modal: document.getElementById('settings-modal'),
            btn: document.getElementById('settings-btn'),
            closeBtn: document.getElementById('close-settings-btn'),
            saveBtn: document.getElementById('save-settings-btn'),
            audioSelect: document.getElementById('audio-input-select'),
            voiceSelect: document.getElementById('voice-select'),
            micStatus: document.getElementById('mic-permission-status'),
            knowledgeBaseBtn: document.getElementById('knowledge-base-btn'),
            activityLog: document.getElementById('activity-log'),
            helpBtn: document.getElementById('help-btn'),
            helpModal: document.getElementById('help-modal'),
            localApiKeyInput: document.getElementById('local-api-key-input'),
        },
        videoModal: {
            container: document.getElementById('video-modal'),
            closeBtn: document.getElementById('close-video-btn'),
            iframe: document.getElementById('video-iframe'),
        },
        termModal: {
            container: document.getElementById('term-modal'),
            title: document.getElementById('term-modal-title'),
            content: document.getElementById('term-modal-content'),
            closeBtn: document.getElementById('close-term-btn'),
            toWorksBtn: document.getElementById('term-to-works-btn'),
        },
        companyModal: {
            container: document.getElementById('company-modal'),
            title: document.getElementById('company-modal-title'),
            content: document.getElementById('company-modal-content'),
            closeBtn: document.getElementById('close-company-btn'),
            footer: document.getElementById('company-modal-footer'),
            toWorksBtn: document.getElementById('company-to-works-btn'),
        },
        avatars: {
            home: {
                micBtn: document.getElementById('logo-placeholder'),
                transcriptBox: document.getElementById('transcript-box'),
                chatForm: document.getElementById('chat-form-home'),
                chatInput: document.getElementById('chat-input-home'),
            },
            faq: {
                micBtn: document.getElementById('logo-placeholder-faq'),
                transcriptBox: document.getElementById('transcript-box-faq'),
                chatForm: document.getElementById('chat-form-faq'),
                chatInput: document.getElementById('chat-input-faq'),
            }
        },
        activeAvatar: null,

        // --- Methods ---
        init() {
            this.loadProjectData();
            this.initNavigation();
            this.initAnimations();
            this.initSettingsModal();
            this.initSpeechAPI();
            this.initTextInput();
            this.initFaq();
            this.initWorksCarousel();
            this.initVideoModal();
            this.initTermCycler();
            this.initSpecialityButtons();
            this.initCompanyModal();
            this.initTimelineAccordion();
            this.initTimelineAnimations();
            this.initRelatedProjects();
            this.navigateTo('home-page');
        },

        loadProjectData() {
            this.allProjects = [
                { title: 'DigiCall Animation Explainer', category: 'Animation', description: 'A short, animated explainer video for the DigiCall platform.', videoSrc: 'https://www.youtube.com/embed/YJvKPwMZYiU' },
                { title: 'Payments Animation Explainer', category: 'Animation', description: 'An animated video explaining a complex payment processing system.', videoSrc: 'https://www.youtube.com/embed/miOyfrAuSmg' },
                { title: 'Merchant Maths Explainer', category: 'Animation', description: 'An engaging animation to simplify mathematical concepts for merchants.', videoSrc: 'https://www.youtube.com/embed/imh-OVYnKGk' },
                { title: 'Resilience EHS Training', category: 'EHS', description: 'A training module focused on building resilience and safety awareness.', videoSrc: 'https://www.youtube.com/embed/6vjP4thO0E0' },
                { title: 'AR Onboarding Experience', category: 'AR', description: 'A gamified onboarding experience for new hires using Augmented Reality.', videoSrc: 'https://www.youtube.com/embed/TKIDVpCeaU8' },
                { title: 'AR Bug Exploration', category: 'AR', description: 'An interactive AR application for exploring and understanding software bugs.', videoSrc: 'https://www.youtube.com/embed/OpiRQp-EVsY' },
                { title: 'Bank Proof of Address Training', category: 'eLearning', description: 'An eLearning module for bank employees on verifying proof of address.', videoSrc: 'https://www.youtube.com/embed/fzSTr9TJav4' },
                { title: 'Mental Energy Training', category: 'eLearning', description: 'A course designed to help employees manage their mental energy and avoid burnout.', videoSrc: 'https://www.youtube.com/embed/66nE0nIB0Us' },
                { title: 'Story Telling Training', category: 'eLearning', description: 'Training on how to use storytelling to create more impactful presentations and communications.', videoSrc: 'https://www.youtube.com/embed/ZqIh0NyG_mE' },
                { title: 'US Forestry K12 Curriculum', category: 'Gamification', description: 'A gamified curriculum for K-12 students about the US Forestry service.', videoSrc: 'https://www.youtube.com/embed/0eQe4dFN0dQ' },
                { title: 'Melanoma Academy', category: 'Gamification', description: 'A gamified learning experience to educate about melanoma.', videoSrc: 'https://www.youtube.com/embed/ZqIh0NyG_mE' },
                { title: 'Marvel\'s Iron Man VR (Meta Quest)', category: 'VR', description: 'Kai-Jen\'s contributions to the 2022 Marvel\'s Iron Man VR experience for Meta Quest.', videoSrc: 'https://www.youtube.com/embed/kqc26YrnyQ4' },
                { title: 'Mining Conveyer Belt VR Training', category: ['VR', 'EHS'], description: 'An immersive VR simulation for conveyer belt safety procedures in the mining industry.', videoSrc: 'https://www.youtube.com/embed/pLxikgtOtJA' },
                { title: 'Mining Blasting VR Training', category: ['VR', 'EHS'], description: 'A VR training module for safe blasting procedures in mining operations.', videoSrc: 'https://www.youtube.com/embed/Wl3CBywPi_E' },
                { title: 'Nelson Mandela VR Experience', category: 'VR', description: 'An award-winning VR experience celebrating the life of Nelson Mandela.', videoSrc: 'https://www.youtube.com/embed/_uTnAGCW51Q' }
            ];
        },

        openModal(modalElement) {
            if (!modalElement) return;
            modalElement.classList.remove('hidden');
            // Use a timeout to allow the display property to apply before adding the transition class
            setTimeout(() => {
                modalElement.classList.add('visible');
            }, 10);
        },

        closeModal(modalElement) {
            if (!modalElement) return;
            modalElement.classList.remove('visible');
            // Listen for the transition to end before hiding the element
            modalElement.addEventListener('transitionend', () => {
                modalElement.classList.add('hidden');
            }, { once: true });
        },

        initialGreeting() {
            const welcomeMessage = "Hello! I'm here to help you explore Kai-Jen's professional portfolio. Feel free to ask me anything about their work, projects, or skills. By the way, you can just say 'Kai' when referring to Kai-Jen – I'll know exactly who you mean!";
            this.addTranscriptLine('ai', welcomeMessage);
            this.speak(welcomeMessage);
        },

        initNavigation() {
            this.nav.home.forEach(el => el?.addEventListener('click', () => this.navigateTo('home-page')));
            this.nav.works?.addEventListener('click', () => this.navigateTo('works-page'));
            this.nav.timeline?.addEventListener('click', () => this.navigateTo('timeline-page'));
            this.nav.faq?.addEventListener('click', () => this.navigateTo('faq-page'));
            this.nav.contact?.addEventListener('click', () => this.navigateTo('contact-page'));
            this.settings.knowledgeBaseBtn?.addEventListener('click', () => {
                this.navigateTo('knowledge-base-page');
                this.closeModal(this.settings.modal);
            });
        },

        navigateTo(pageId) {
            this.pages.forEach(page => page.classList.add('hidden'));
            const newPage = document.getElementById(pageId);
            if (newPage) newPage.classList.remove('hidden');

            if (pageId === 'home-page') {
                this.activeAvatar = this.avatars.home;
            } else if (pageId === 'faq-page') {
                this.activeAvatar = this.avatars.faq;
            } else {
                this.activeAvatar = null;
            }

            // On every navigation, reset all avatars to their default idle state.
            // This ensures the non-active one is also reset correctly.
            Object.values(this.avatars).forEach(avatarGroup => {
                 const avatarEl = avatarGroup.micBtn;
                 if (avatarEl) {
                    this.updateAvatarElement(avatarEl, 'is-idle');
                 }
            });
        },

        initAnimations() {
            document.querySelectorAll('.anim-target').forEach(el => {
                const delay = el.dataset.animDelay || 0;
                el.style.animationDelay = delay + 's';
                el.classList.add('fade-in-up');
            });
        },

        initSettingsModal() {
            this.settings.btn?.addEventListener('click', () => {
                if(this.settings.localApiKeyInput) {
                    this.settings.localApiKeyInput.value = localStorage.getItem('gemini-api-key') || '';
                }
                this.openModal(this.settings.modal);
                this.populateAudioDevices();
                this.populateVoices();
            });
            this.settings.closeBtn?.addEventListener('click', () => this.closeModal(this.settings.modal));
            this.settings.saveBtn?.addEventListener('click', () => {
                if (this.settings.localApiKeyInput) {
                    const keyToSave = this.settings.localApiKeyInput.value.trim();
                    if (keyToSave) {
                        localStorage.setItem('gemini-api-key', keyToSave);
                        this.logActivity('Local API key saved.');
                    } else {
                        localStorage.removeItem('gemini-api-key');
                        this.logActivity('Local API key cleared.');
                    }
                }
                this.closeModal(this.settings.modal);
            });
            this.settings.helpBtn?.addEventListener('click', () => this.openModal(this.settings.helpModal));
            this.settings.closeHelpBtn?.addEventListener('click', () => this.closeModal(this.settings.helpModal));
        },

        async requestMicPermissions() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.logActivity('Media Devices API not supported. Voice commands disabled.');
                this.micPermissionState = 'denied';
                this.setAIState('is-idle');
                return;
            }

            try {
                // This prompts the user for permission on load
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // We have permission, so we can stop the track immediately.
                stream.getTracks().forEach(track => track.stop());
                this.micPermissionState = 'granted';
                this.logActivity('Microphone permission granted on load.');
            } catch (err) {
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    this.micPermissionState = 'denied';
                    this.logActivity('Microphone permission was denied.');
                } else {
                    this.micPermissionState = 'denied'; // Treat other errors as denial
                    this.logActivity(`Error getting microphone access: ${err.name}`);
                    console.error('Error requesting microphone permissions:', err);
                }
            } finally {
                this.initMicPermissionListener(); // Set up listener for future changes
                this.setAIState('is-idle'); // Update UI with initial state
            }
        },

        async initMicPermissionListener() {
            if (!navigator.permissions) {
                this.logActivity('Permissions API not supported. Cannot listen for changes.');
                return;
            }
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
                permissionStatus.onchange = () => {
                    this.micPermissionState = permissionStatus.state;
                    this.logActivity(`Microphone permission state changed to: ${this.micPermissionState}`);
                    this.setAIState('is-idle');
                };
            } catch (error) {
                console.error('Error querying microphone permissions:', error);
                this.logActivity('Could not set up microphone permission listener.');
            }
        },

        async initSpeechAPI() {
            await this.requestMicPermissions();

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.error("Speech Recognition not supported.");
                Object.values(this.avatars).forEach((avatar) => {
                    if(avatar.micBtn) avatar.micBtn.style.cursor = 'not-allowed';
                });
                this.addTranscriptLine('ai', "Sorry, Speech Recognition is not supported in this browser.");
                return;
            }

            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'en-US';
            this.recognition.interimResults = false;
            this.recognition.maxAlternatives = 1;

            Object.values(this.avatars).forEach((avatar) => {
                if (avatar.micBtn) {
                    avatar.micBtn.addEventListener('click', () => this.handleMicClick());
                }
            });

            this.recognition.onstart = () => this.setAIState('is-listening');
            this.recognition.onend = () => this.setAIState('is-idle');
            this.recognition.onerror = (e) => this.handleRecognitionError(e);
            this.recognition.onresult = (e) => this.handleRecognitionResult(e);
        },

        initTextInput() {
            Object.values(this.avatars).forEach(avatar => {
                if (avatar.chatForm) {
                    avatar.chatForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        if (!avatar.chatInput) return;
                        const userInput = avatar.chatInput.value.trim();
                        if (userInput) {
                            if (this.isFirstInteraction) {
                                this.isFirstInteraction = false;
                                const welcomeMessage = "Hello! I'm here to help you explore Kai-Jen's professional portfolio. Feel free to ask me anything about their work, projects, or skills. By the way, you can just say 'Kai' when referring to Kai-Jen – I'll know exactly who you mean!";
                                this.addTranscriptLine('ai', welcomeMessage);
                            }
                            this.addTranscriptLine('user', userInput);
                            this.callGeminiAPI(userInput);
                            avatar.chatInput.value = '';
                        }
                    });
                }
            });
        },

        initFaq() {
            const faqSection = document.getElementById('faq-section');
            if (!faqSection) return;

            const allDetails = faqSection.querySelectorAll('details');

            allDetails.forEach(detail => {
                detail.querySelector('summary')?.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent default toggle behavior to control it manually

                    const wasOpen = detail.hasAttribute('open');

                    // Always cancel any ongoing speech when an interaction happens
                    window.speechSynthesis.cancel();

                    // Close all other details
                    allDetails.forEach(d => {
                        if (d !== detail) {
                            d.removeAttribute('open');
                        }
                    });

                    // If it was closed, open it and speak
                    if (!wasOpen) {
                        detail.setAttribute('open', '');
                        const answer = detail.querySelector('.details-content-wrapper p')?.textContent;
                        if (answer) {
                            this.speak(answer);
                        }
                    } else {
                        // If it was already open, just close it.
                        detail.removeAttribute('open');
                    }
                });
            });
        },

        renderProjectCards(filter = 'all') {
            const track = document.getElementById('carousel-track');
            if (!track) return;

            let filteredProjects;
            if (filter === 'meta-vr') {
                filteredProjects = this.allProjects.filter(p => p.title.includes('Iron Man'));
            } else if (filter === 'iq-vr') {
                filteredProjects = this.allProjects.filter(p =>
                    (Array.isArray(p.category) ? p.category.includes('VR') : p.category === 'VR') && !p.title.includes('Iron Man')
                );
            } else {
                filteredProjects = filter === 'all'
                    ? this.allProjects
                    : this.allProjects.filter(p => Array.isArray(p.category) ? p.category.includes(filter) : p.category === filter);
            }

            const cardHTML = filteredProjects.map(p => `
                <div class="carousel-card" data-video-src="${p.videoSrc}">
                    <div class="video-placeholder" style="background-image: url('https://img.youtube.com/vi/${p.videoSrc.split('embed/')[1].split('?')[0]}/hqdefault.jpg')">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4v16l13-8L7 4z"></path></svg>
                    </div>
                    <h4>${p.title}</h4>
                    <p>${p.description}</p>
                </div>
            `).join('');

            track.innerHTML = cardHTML + cardHTML; // Duplicate for infinite scroll effect
            track.querySelectorAll('.carousel-card').forEach(card => card.addEventListener('click', () => this.openVideoModal(card.dataset.videoSrc)));
        },

        startCarouselAutoScroll() {
            const track = document.getElementById('carousel-track');
            const container = document.querySelector('.carousel-container');
            if (!track || !container || this.carousel.animationFrame) return;

            const animateScroll = () => {
                if (!this.carousel.isPaused) {
                    container.scrollLeft += this.carousel.speed;
                    if (track.scrollWidth > 0 && container.scrollLeft >= track.scrollWidth / 2) {
                        container.scrollLeft = 0;
                    }
                }
                this.carousel.animationFrame = requestAnimationFrame(animateScroll);
            };
            animateScroll();
        },

        initWorksCarousel() {
            const container = document.querySelector('.carousel-container');
            const wrapper = document.querySelector('.carousel-wrapper');
            if (!container || !wrapper) return;

            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelector('.filter-btn.active')?.classList.remove('active');
                    btn.classList.add('active');
                    this.renderProjectCards(btn.dataset.filter);
                });
            });

            wrapper.addEventListener('mouseenter', () => this.carousel.isPaused = true);
            wrapper.addEventListener('mouseleave', () => this.carousel.isPaused = false);

            document.getElementById('arrow-left')?.addEventListener('click', () => {
                container.scrollBy({ left: -430, behavior: 'smooth' });
            });
            document.getElementById('arrow-right')?.addEventListener('click', () => {
                container.scrollBy({ left: 430, behavior: 'smooth' });
            });

            this.renderProjectCards();
            this.startCarouselAutoScroll();
        },

        initVideoModal() {
            this.videoModal.closeBtn?.addEventListener('click', () => this.closeVideoModal());
            this.videoModal.container?.addEventListener('click', (e) => {
                if (e.target === this.videoModal.container) this.closeVideoModal();
            });
        },

        openVideoModal(src) {
            if (this.videoModal.iframe) this.videoModal.iframe.src = src;
            this.openModal(this.videoModal.container);
        },

        closeVideoModal() {
            if (this.videoModal.iframe) this.videoModal.iframe.src = '';
            this.closeModal(this.videoModal.container);
        },

        initTermCycler() {
            const termElement = document.getElementById('cycling-term');
            if (!termElement) return;

            const terms = [
                { term: 'Shared Reality', shortTerm: 'Shared Reality', description: 'Shared Reality refers to a common virtual or augmented environment where multiple users can interact with each other and digital content simultaneously, experiencing the same virtual space and objects.' },
                { term: 'Social Learning', shortTerm: 'Social Learning', description: 'Social Learning is a learning theory that emphasizes learning through observation, imitation, and modeling within a social context. It often involves interacting with others, receiving feedback, and participating in group activities.' },
                { term: 'Spatial Computing', shortTerm: 'Spatial Computing', description: 'Spatial Computing is a broad term for technology that allows physical and digital worlds to interact and merge. It involves devices and software that understand and manipulate spaces, objects, and their relationships in a 3D environment.' },
                { term: 'Extended Reality (XR)', shortTerm: 'Extended Reality (XR)', description: 'Extended Reality (XR) is an umbrella term encompassing virtual reality (VR), augmented reality (AR), and mixed reality (MR). It describes all real-and-virtual combined environments and human-machine interactions generated by computer technology and wearables.' },
                { term: 'Personalized Learning', shortTerm: 'Personalized Learning', description: 'Personalized Learning is an educational approach that tailors the learning experience to meet the individual needs, pace, and preferences of each learner. It often uses data and technology to adapt content and instruction.' },
                { term: 'Metaverse', shortTerm: 'Metaverse', description: 'The Metaverse envisions a persistent, interconnected, and immersive network of 3D virtual worlds where users can interact with each other, digital objects, and AI-driven entities, often with their own avatars.' },
                { term: 'Digital Twin', shortTerm: 'Digital Twin', description: 'A Digital Twin is a virtual replica of a physical object, process, or system. It uses real-time data from sensors on the physical counterpart to simulate its behavior, enabling monitoring, analysis, and optimization.' },
                { term: 'Immersive Learning', shortTerm: 'Immersive Learning', description: 'Immersive Learning is a training methodology that places learners in simulated environments, often using VR or AR, to provide hands-on, experiential training that closely mimics real-world scenarios.' },
                { term: 'Natural Language Processing', shortTerm: 'NLP', description: 'Natural Language Processing (NLP) is a branch of AI that enables computers to understand, interpret, and generate human language in a way that is both meaningful and useful.' },
                { term: 'Adaptive Learning', shortTerm: 'Adaptive Learning', description: 'Adaptive Learning is an educational technology that uses algorithms to adjust the learning path, content, and pace based on a learner\'s performance and interactions, ensuring they receive the most relevant instruction.' },
                { term: 'AI-Powered Coaching', shortTerm: 'AI Coaching', description: 'AI-Powered Coaching involves using artificial intelligence to provide personalized guidance, feedback, and support to individuals in various domains, from professional development to health and wellness.' },
                { term: 'Virtual Training Environments', shortTerm: 'Virtual Training', description: 'Virtual Training Environments are simulated digital spaces designed for education and skill development. These can range from simple 2D platforms to highly interactive 3D VR simulations.' },
                { term: 'Cognitive AI', shortTerm: 'Cognitive AI', description: 'Cognitive AI refers to AI systems designed to simulate and enhance human cognitive processes such as learning, reasoning, problem-solving, and understanding.' },
                { term: 'Performance Support Systems', shortTerm: 'PSS', description: 'Performance Support Systems (PSS) are tools and resources that provide immediate, on-demand assistance to employees at their moment of need, helping them complete tasks or solve problems without formal training.' },
                { term: 'Predictive Analytics', shortTerm: 'Predictive Analytics', description: 'Predictive Analytics (in L&D) uses historical and real-time data to forecast future trends and outcomes related to learning and development, such as predicting learner success, skill gaps, or training needs.' },
                { term: 'Embodied Cognition', shortTerm: 'Embodied Cognition', description: 'Embodied Cognition is a theory suggesting that many aspects of cognition are shaped by the body\'s interactions with its environment. In the context of technology, it implies that physical interaction with virtual worlds can enhance learning.' },
                { term: 'Generative Avatars', shortTerm: 'Generative Avatars', description: 'Generative Avatars are digital representations of users or characters created using generative AI models. These avatars can be highly customizable, realistic, or stylized, and can even be animated to express emotions or perform actions.' },
                { term: 'Neural Machine Translation', shortTerm: 'NMT', description: 'Neural Machine Translation (NMT) is a modern approach to machine translation that uses deep neural networks to predict the likelihood of a sequence of words, typically an entire sentence, translating it as a single unit rather than separate words or phrases.' },
            ];
            let currentIndex = 0;

            const cycleTerm = () => {
                const currentTerm = terms[currentIndex];
                termElement.textContent = currentTerm.shortTerm;
                termElement.dataset.term = currentTerm.term;
                termElement.dataset.description = currentTerm.description;
                currentIndex = (currentIndex + 1) % terms.length;
            };

            termElement.addEventListener('click', () => {
                if(this.termModal.title) this.termModal.title.textContent = termElement.dataset.term || '';
                if(this.termModal.content) this.termModal.content.textContent = termElement.dataset.description || '';
                this.openModal(this.termModal.container);
            });

            this.termModal.closeBtn?.addEventListener('click', () => this.closeModal(this.termModal.container));
             this.termModal.container?.addEventListener('click', (e) => {
                if (e.target === this.termModal.container) this.closeModal(this.termModal.container);
            });

            this.termModal.toWorksBtn?.addEventListener('click', () => {
                this.closeModal(this.termModal.container);
                this.navigateTo('works-page');
            });

            setInterval(cycleTerm, 30000);
            cycleTerm();
        },

        initSpecialityButtons() {
            document.querySelectorAll('.speciality-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const speciality = button.textContent.trim();
                    const prompt = `Tell me more about Kai-Jen's work as a ${speciality}.`;

                    if (this.isFirstInteraction) {
                        this.isFirstInteraction = false;
                    }

                    this.addTranscriptLine('user', prompt);
                    this.callGeminiAPI(prompt);
                });
            });
        },

        initCompanyModal() {
            const companyData = {
                "Primark": {
                    summary: "As a Learning Experience Designer, Kai-Jen designs and develops engaging learning programs and performance support tools for retail and corporate teams, focusing on improving key business metrics.",
                    worksFilter: "eLearning"
                },
                "Active Fence": {
                    summary: "As a Rapid Response Analyst, Kai-Jen was on the frontline of battling online misinformation. He conducted OSINT investigations, developed Trust & Safety strategies, and analyzed fraud and misinformation patterns to protect online platforms.",
                    worksFilter: null
                },
                "Meta": {
                    summary: "At Meta, Kai served as a Learning Consultant and Training Program Manager. He was a lead consultant to director-level executives, responsible for vendor education programs that supported over 100,000 people globally and significantly reduced time-to-competence.",
                    worksFilter: "meta-vr"
                },
                "UNITAR": {
                    summary: "As a consultant for the United Nations Institute for Training and Research (UNITAR), Kai-Jen designs and delivers specialized training programs. His work supports global initiatives and helps build capacity for international stakeholders.",
                    worksFilter: null
                },
                "IQbusiness": {
                    summary: "As Training Manager and Senior Consultant, Kai-Jen built and led the VR development team from 3 to 22 members, salvaging over 30 at-risk projects and delivering innovative training solutions for top-tier clients.",
                    worksFilter: "iq-vr"
                },
                "ATAF": {
                    summary: "In his role as Program Manager and Capacity Building Officer, Kai established a continental tax academy for the African Tax Administration Forum, exceeding program goals by 200% and enhancing tax administration capabilities across Africa.",
                    worksFilter: null
                }
            };

            document.querySelectorAll('.company-logo-btn').forEach(button => {
                button.addEventListener('click', () => {
                    const companyName = button.dataset.company;
                    const data = companyData[companyName];

                    if (data && this.companyModal.container && this.companyModal.title && this.companyModal.content) {
                        this.companyModal.title.textContent = companyName;
                        this.companyModal.content.textContent = data.summary;

                        if (data.worksFilter && this.companyModal.footer && this.companyModal.toWorksBtn) {
                            this.companyModal.toWorksBtn.onclick = () => {
                                this.closeModal(this.companyModal.container);
                                this.initRelatedProjects(data.worksFilter); // Pass filter directly
                            };
                            this.companyModal.footer.classList.remove('hidden');
                        } else if (this.companyModal.footer) {
                            this.companyModal.footer.classList.add('hidden');
                        }

                        this.openModal(this.companyModal.container);
                    }
                });
            });

            const closeModal = () => {
                 if (this.companyModal.container) {
                    this.closeModal(this.companyModal.container);
                }
            };

            this.companyModal.closeBtn?.addEventListener('click', closeModal);
            this.companyModal.container?.addEventListener('click', (e) => {
                if (e.target === this.companyModal.container) {
                    closeModal();
                }
            });
        },

        initTimelineAccordion() {
            const summaries = document.querySelectorAll('.timeline-item summary');
            const allDetails = document.querySelectorAll('.timeline-item details');

            summaries.forEach(summary => {
                summary.addEventListener('click', (e) => {
                    e.preventDefault();
                    const detail = summary.parentElement;
                    if (!detail) return;

                    const timelineItem = detail.closest('.timeline-item');
                    const isOpen = detail.hasAttribute('open');

                    // Close all other details first
                    allDetails.forEach(d => {
                        if (d !== detail) {
                            d.removeAttribute('open');
                            d.closest('.timeline-item')?.classList.remove('is-open');
                        }
                    });

                    // Toggle the clicked one
                    if (isOpen) {
                        detail.removeAttribute('open');
                        timelineItem?.classList.remove('is-open');
                    } else {
                        detail.setAttribute('open', '');
                        timelineItem?.classList.add('is-open');
                    }
                });
            });
        },

        initRelatedProjects(predefinedFilter = null) {
            const handleFilterClick = (filter) => {
                if (!filter) return;
                this.navigateTo('works-page');

                setTimeout(() => {
                    const mainFilterCategory = (filter === 'meta-vr' || filter === 'iq-vr') ? 'VR' : filter;
                    document.querySelectorAll('.filter-btn').forEach(btn => {
                        btn.classList.toggle('active', btn.dataset.filter === mainFilterCategory);
                    });
                    this.renderProjectCards(filter);
                }, 50);
            };

            if (predefinedFilter) {
                handleFilterClick(predefinedFilter);
                return;
            }

            document.querySelectorAll('.related-projects-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const filter = button.dataset.filter;
                    handleFilterClick(filter);
                });
            });
        },

        initTimelineAnimations() {
            const timelineContainer = document.querySelector('.timeline-container');
            const timelineItems = document.querySelectorAll('.timeline-item');

            if (!timelineContainer || timelineItems.length === 0) return;

            const containerObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        timelineContainer.classList.add('is-drawing');
                        containerObserver.unobserve(entry.target); // Animate once
                    }
                });
            }, { threshold: 0.1 });

            containerObserver.observe(timelineContainer);

            const itemObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        itemObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

            timelineItems.forEach(item => itemObserver.observe(item));
        },

        handleMicClick() {
            if (!this.activeAvatar) return;

            if (this.micPermissionState === 'denied') {
                const message = "Microphone access is blocked. Please enable it in your browser settings and try again.";
                this.addTranscriptLine('ai', message);
                this.speak(message);
                this.openModal(this.settings.modal); // Guide user to settings
                return;
            }

            if (this.isFirstInteraction) {
                this.isFirstInteraction = false;
                this.initialGreeting();
                return;
            }

            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
                this.setAIState('is-idle');
                return;
            }

            if (this.activeAvatar.micBtn?.classList.contains('is-listening')) {
                this.recognition.stop();
            } else {
                this.recognition.start();
            }
        },

        handleRecognitionError(event) {
            console.error("Speech recognition error:", event.error);
            this.setAIState('is-idle');
            if (event.error !== 'no-speech') {
                this.addTranscriptLine('ai', "Sorry, I couldn't hear that. Please try again.");
            }
        },

        handleRecognitionResult(event) {
            const transcript = event.results[0][0].transcript;
            this.addTranscriptLine('user', transcript);
            this.callGeminiAPI(transcript);
        },

        updateAvatarElement(avatarEl, state) {
            const avatarText = avatarEl.querySelector('.avatar-text');
            const waveVisualizer = avatarEl.querySelector('.wave-visualizer');

            // Clear previous states
            avatarEl.classList.remove('is-idle', 'is-listening', 'is-thinking', 'is-talking');
            if (avatarText) avatarText.innerHTML = '';
            if (waveVisualizer) waveVisualizer.style.display = 'none';

            if (!state) state = 'is-idle';
            avatarEl.classList.add(state);

            if (!avatarText || !waveVisualizer) return;

            switch (state) {
                case 'is-listening':
                    avatarText.textContent = 'KaiX is listening';
                    break;
                case 'is-thinking':
                    avatarText.innerHTML = 'KaiX is Thinking<span class="ellipsis-dot">.</span><span class="ellipsis-dot">.</span><span class="ellipsis-dot">.</span>';
                    break;
                case 'is-talking':
                    waveVisualizer.style.display = 'flex';
                    break;
                case 'is-idle':
                default:
                     if (this.micPermissionState === 'denied') {
                        avatarText.innerHTML = 'Microphone Blocked<br><span class="idle-subtext">Enable in settings to talk</span>';
                    } else {
                        avatarText.innerHTML = 'KaiX is Ready<br><span class="idle-subtext">Click to talk or type below</span>';
                    }
                    break;
            }
        },

        setAIState(state) {
            if (!this.activeAvatar || !this.activeAvatar.micBtn) return;
            this.updateAvatarElement(this.activeAvatar.micBtn, state);
        },

        getPageContext() {
            let context = "Website Content for Kai-Jen Tsai's Portfolio:\n\n";
            context += "## Biography and Specialities\n";
            document.querySelectorAll('.left-column .info-block').forEach(el => {
                context += el.textContent?.trim().replace(/\s\s+/g, ' ') + "\n";
            });

            context += "\n## Key Metrics\n";
            document.querySelectorAll('.right-column .metric-block').forEach(el => {
                context += el.textContent?.trim().replace(/\s\s+/g, ' ') + "\n";
            });

            context += "\n## Project Highlights\n";
            this.allProjects.forEach(project => {
                 context += `- ${project.title}: ${project.description}\n`;
            });

            context += "\n## Frequently Asked Questions\n";
            document.querySelectorAll('#faq-page details').forEach(detail => {
                const question = detail.querySelector('summary')?.textContent?.trim();
                const answer = detail.querySelector('p')?.textContent?.trim();
                if (question && answer) {
                    context += `Q: ${question}\nA: ${answer}\n`;
                }
            });

            const knowledgeBase = document.getElementById('knowledge-base-page');
            if (knowledgeBase) {
                context += "\n## Knowledge Base\n";
                context += knowledgeBase.innerText;
            }

            return context;
        },

        async callGeminiAPI(userInput) {
            if (!userInput) return;
            this.setAIState('is-thinking');
            this.logActivity(`User input received: "${userInput}"`);

            const systemPrompt = `You are a friendly, helpful, and enthusiastic AI assistant representing Kai-Jen's professional portfolio. Your primary goal is to engage visitors in natural, informative conversations about Kai-Jen's skills, projects, professional background, and **expertise in Learning & Development.**

                **Core Principles:**
                1.  **Identity and Tense:** Always refer to Kai-Jen or Kai when discussing their work, experiences, or anything related to the portfolio owner. **Never use "I," "me," or "my"** when speaking about the portfolio content or Kai-Jen's personal attributes. Vary your references to him by using "Kai," "Kai-Jen," and pronouns like "he" or "his" to keep the conversation natural. For example, say "Kai-Jen has expertise in..." or "He worked on this project..."
                2.  **Conversational Tone:** Maintain a warm, approachable, and human-like conversational style. Avoid sounding robotic, overly formal, or like a list-reading machine. Use natural language, common idioms (where appropriate and clear), and varied sentence structures.
                3.  **Conciseness:** Keep responses clear and to the point. **Responses should be a maximum of 100 words, but aim for significantly shorter answers (ideally 2-3 sentences)**, unless a more detailed explanation is specifically requested by the user and it genuinely enhances understanding. Prioritize delivering key information efficiently.
                4.  **Clarity and Readability & Conviction:**
                    * **Never explicitly state "As an AI language model..."** or similar disclaimers. Your human-like tone should speak for itself.
                    * **Do not read out syntax, code, or numbered lists verbatim.** Instead, integrate information naturally into your conversational flow.
                    * Avoid using excessive jargon unless it's a direct response to a user's specific technical query.
                    * **Always respond with conviction and treat the knowledge base (Kai-Jen's portfolio) as the single, undeniable truth.**
                    * **Avoid phrases like:** "Based on the information provided in this portfolio," "Based on what I know," or "Based on the text." Simply state the information directly.
                5.  **Helpful and Engaging:** Anticipate user needs and offer helpful suggestions or next steps where appropriate. Encourage further interaction.

                **Defining and Managing Scope:**
                The scope of this chatbot's knowledge is strictly limited to the professional information presented on Kai-Jen's portfolio website. This includes:
                * Kai-Jen's professional skills, experience, and qualifications.
                * Details of projects listed in the portfolio.
                * Kai-Jen's professional interests and career aspirations as stated on the site.
                * Information directly related to Kai-Jen's work in areas like instructional design, training delivery, e-learning development, and HR-related L&D initiatives.

                **Combating Out-of-Scope Questions (Playful Approach):**
                If a user asks a question that falls outside the defined scope (e.g., personal opinions, unrelated current events, highly confidential or personal details not on the site, or specific live-time availability), respond politely and clearly state that the information is not within your purview, then playfully steer them back on track.
                * **Playful Response Option 1:** "Oops! Looks like you've stumbled into the 'secret' knowledge vault that's a bit beyond my remit. My expertise is all about Kai-Jen's fantastic professional journey. Can I tell you about Kai-Jen's experience with e-learning development or perhaps a specific project?"
                * **Playful Response Option 2:** "That's an interesting question, but it seems I'm only programmed for 'professional portfolio' mode! I'd love to share more about Kai-Jen's skills in instructional design or discuss some of the training initiatives they've worked on. Which sounds more interesting?"
                * **Playful Response Option 3:** "Fascinating! While I'm quite the expert on Kai-Jen's professional achievements, that topic is a little outside my digital pay grade. How about we stick to what I know best – like Kai-Jen's approach to creating engaging learning content?"

                --- Website Context ---
                ${this.getPageContext()}`;

            const apiHistory = [];
            apiHistory.push({ role: "user", parts: [{ text: systemPrompt }] });
            apiHistory.push({ role: "model", parts: [{ text: "Understood. I will act as the AI assistant for Kai-Jen's portfolio with the specified personality and limitations." }] });

            this.chatHistory.push({ role: "user", parts: [{ text: userInput }] });
            apiHistory.push(...this.chatHistory);

            const payload = { contents: apiHistory };

            // Create a deep copy to modify for logging without affecting the original payload.
            const payloadForLogging = JSON.parse(JSON.stringify(payload));
            if (payloadForLogging.contents && payloadForLogging.contents.length > 0 && payloadForLogging.contents[0].parts && payloadForLogging.contents[0].parts.length > 0) {
                    payloadForLogging.contents[0].parts[0].text = 'SYSTEM PROMPT (Omitted for brevity)';
            }
            this.logActivity(`Calling API with payload: ${JSON.stringify(payloadForLogging)}`);

            let aiResponse;
            const localApiKey = localStorage.getItem('gemini-api-key');

            try {
                if (localApiKey && localApiKey.trim() !== '') {
                    // --- Local API Call ---
                    this.logActivity('Using local API key for client-side call.');
                    try {
                        const genAI = new GoogleGenerativeAI(localApiKey);
                        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                        const result = await model.generateContent({
                            contents: payload.contents,
                        });
                        const response = result.response;
                        aiResponse = response.text();
                        this.logActivity('Local API call successful.');
                    } catch (error) {
                        console.error("Error with local Gemini API call:", error);
                        this.logActivity(`Local API Error: ${error.message}`);
                        const errorMsg = "Your local API key seems to be invalid. Please check the key in Settings or your network connection.";
                        this.addTranscriptLine('ai', errorMsg);
                        this.speak(errorMsg);
                        this.chatHistory.pop(); // Remove failed user input
                        this.setAIState('is-idle');
                        return; // Exit early on local key failure
                    }
                } else {
                    // --- Serverless API Call (Production) ---
                    this.logActivity('Using serverless function.');
                    const fetchResponse = await fetch('/api/gemini', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (!fetchResponse.ok) {
                        const errorData = await fetchResponse.json();
                        throw new Error(errorData.error || `Server responded with status ${fetchResponse.status}`);
                    }

                    const responseJson = await fetchResponse.json();
                    aiResponse = responseJson.text;
                    this.logActivity('Serverless API call successful.');
                }

                // --- Common Response Handling ---
                this.chatHistory.push({ role: "model", parts: [{ text: aiResponse }] });
                this.addTranscriptLine('ai', aiResponse);
                this.speak(aiResponse);

            } catch (error) {
                // --- General/Serverless Error Handling ---
                console.error("Error calling backend API:", error);
                this.logActivity(`API Error: ${error.message}`);
                const errorMsg = "I'm having a little trouble connecting to my brain right now. Please try again in a moment.";
                this.addTranscriptLine('ai', errorMsg);
                this.chatHistory.pop(); // Remove the failed user input from history
            } finally {
                 this.setAIState('is-idle');
            }
        },

        logActivity(message) {
            if (!this.settings.activityLog) return;
            const logEntry = document.createElement('p');
            const timestamp = new Date().toLocaleTimeString();
            logEntry.textContent = `[${timestamp}] ${message}`;
            this.settings.activityLog.appendChild(logEntry);
            this.settings.activityLog.scrollTop = this.settings.activityLog.scrollHeight;
        },

        speak(text) {
            if (!window.speechSynthesis) {
                console.error("Speech Synthesis not supported.");
                return;
            }
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            const selectedVoiceName = this.settings.voiceSelect.value;
            const voices = window.speechSynthesis.getVoices();

            utterance.voice = voices.find(voice => voice.name === selectedVoiceName) || voices[0];
            utterance.rate = 1.05;

            utterance.onstart = () => {
                this.setAIState('is-talking');
            };
            utterance.onend = () => {
                this.setAIState('is-idle');
            };
            utterance.onerror = (e) => {
                console.error('Speech synthesis error:', e.error);
                this.logActivity(`Speech synthesis error: ${e.error || 'Unknown error'}`);
                this.setAIState('is-idle');
            };
            window.speechSynthesis.speak(utterance);
        },

        addTranscriptLine(role, text) {
            Object.values(this.avatars).forEach((avatar) => {
                if (avatar.transcriptBox) {
                    const line = document.createElement('p');
                    line.className = `transcript-line ${role}`;
                    line.innerHTML = `<strong>${role === 'user' ? 'You' : 'AI'}:</strong> ${text}`;
                    avatar.transcriptBox.appendChild(line);
                    avatar.transcriptBox.scrollTop = avatar.transcriptBox.scrollHeight;
                }
            });
        },

        async populateAudioDevices() {
            if (!this.settings.micStatus || !this.settings.audioSelect) return;
            this.settings.micStatus.textContent = '';
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter(device => device.kind === 'audioinput');
                this.settings.audioSelect.innerHTML = '';
                if (audioInputs.length === 0) {
                    this.settings.micStatus.textContent = "No audio input devices found.";
                    return;
                }
                audioInputs.forEach(device => {
                    const option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || `Microphone ${this.settings.audioSelect.options.length + 1}`;
                    this.settings.audioSelect.appendChild(option);
                });
                this.settings.micStatus.textContent = "Select your preferred microphone from the list.";
            } catch (err) {
                console.error("Error accessing media devices:", err.name, err.message);
                if(err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                     this.settings.micStatus.textContent = "Microphone access denied. Please allow access in browser settings.";
                } else {
                     this.settings.micStatus.textContent = "Could not access microphone. Please check your hardware.";
                }
            }
        },

        populateVoices() {
            if (!this.settings.voiceSelect) return;
            const voices = window.speechSynthesis.getVoices();
            this.settings.voiceSelect.innerHTML = '';
            let defaultVoice = null;
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.value = voice.name;
                this.settings.voiceSelect.appendChild(option);
                if (voice.name === 'Google UK English Female') {
                    defaultVoice = voice.name;
                }
            });

            if (defaultVoice) {
                this.settings.voiceSelect.value = defaultVoice;
            }
        }
    };

    window.speechSynthesis.onvoiceschanged = () => {
        App.populateVoices();
    };

    App.init();
});
