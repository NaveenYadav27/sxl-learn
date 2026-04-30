
-- =====================================================================
-- K8S-FDN — Kubernetes & Docker Foundation: seed modules, labs, steps
-- All labs use the K8s/Docker terminal simulator (simulator='k8s-terminal')
-- =====================================================================

-- ---------- Modules ----------
INSERT INTO public.modules (slug, title, description, domain_code, sort_order, icon) VALUES
('k8s-containerization-fundamentals', 'Containerization Fundamentals & Docker Architecture', 'VMs vs containers, Docker engine, OCI runtime and lifecycle.',                'K8S-M1', 200, 'Container'),
('k8s-docker-images',                 'Building Docker Images & Containerized Apps',          'Dockerfile authoring, image layers, tagging and registry push.',              'K8S-M2', 201, 'Container'),
('k8s-fundamentals',                  'Kubernetes Fundamentals & Pod Architecture',           'Control plane, worker nodes, Pods and the kubectl workflow.',                 'K8S-M3', 202, 'Container'),
('k8s-deployments-services',          'Deployments & Service Exposure',                       'Deployments, rolling updates, ClusterIP / NodePort / LoadBalancer.',          'K8S-M4', 203, 'Container'),
('k8s-monitoring-troubleshooting',    'Monitoring, Troubleshooting & Capstone Prep',          'Logs, events, kubectl top, debugging CrashLoopBackOff and capstone deploy.',  'K8S-M5', 204, 'Container')
ON CONFLICT (slug) DO NOTHING;

-- ---------- Labs ----------
WITH m AS (SELECT slug, id FROM public.modules WHERE slug LIKE 'k8s-%')
INSERT INTO public.labs (module_id, slug, title, scenario, objective, difficulty, duration_min, simulator, sort_order)
SELECT m.id, v.slug, v.title, v.scenario, v.objective, v.difficulty, v.duration_min, v.simulator, v.sort_order
FROM (VALUES
  -- M1: Containerization Fundamentals
  ('k8s-containerization-fundamentals','k8s-docker-install-tour','Docker install & engine tour','Inspect the Docker engine, version and daemon on a fresh workstation.',         'Confirm Docker CLI works and read engine info.',       'beginner',     15, 'k8s-terminal', 1),
  ('k8s-containerization-fundamentals','k8s-pull-run-inspect',   'Pull, run and inspect a container','Pull nginx, run it detached, then inspect the running container.',           'Run a detached container and read its metadata.',      'beginner',     20, 'k8s-terminal', 2),
  ('k8s-containerization-fundamentals','k8s-container-lifecycle','Container lifecycle: stop, start, remove','Walk a container through the full create/run/stop/remove lifecycle.', 'Stop and remove a container cleanly.',                 'beginner',     20, 'k8s-terminal', 3),

  -- M2: Building Docker Images
  ('k8s-docker-images','k8s-write-dockerfile','Read and reason about a Dockerfile','Open a sample Dockerfile and walk each instruction line by line.',                          'Identify FROM, COPY, RUN, EXPOSE and CMD.',            'beginner',     20, 'k8s-terminal', 1),
  ('k8s-docker-images','k8s-build-tag-image', 'Build and tag a Docker image',     'Build a Python web app image from the Dockerfile and tag it for release.',                    'Produce shadowx/app:1.0 from source.',                 'beginner',     25, 'k8s-terminal', 2),
  ('k8s-docker-images','k8s-push-to-registry','Push the image to a registry',     'Authenticate to Docker Hub then push your tagged image so a cluster can pull it.',            'Push shadowx/app:1.0 to the registry.',                'intermediate', 25, 'k8s-terminal', 3),

  -- M3: Kubernetes Fundamentals
  ('k8s-fundamentals','k8s-cluster-tour',     'Kubernetes cluster tour',          'Tour a kind cluster: nodes, namespaces, control-plane endpoints.',                            'Read nodes, namespaces and cluster-info.',             'beginner',     20, 'k8s-terminal', 1),
  ('k8s-fundamentals','k8s-deploy-first-pod', 'Deploy your first Pod',            'Apply a Deployment manifest to create your first multi-replica workload.',                    'See 3 Pods Running.',                                  'beginner',     25, 'k8s-terminal', 2),
  ('k8s-fundamentals','k8s-scale-replicas',   'Scale a Deployment',               'Scale the running Deployment up to 5 replicas with kubectl scale.',                           'Confirm 5/5 replicas are Available.',                  'intermediate', 20, 'k8s-terminal', 3),

  -- M4: Deployments & Services
  ('k8s-deployments-services','k8s-author-deployment-yaml','Read a Deployment manifest','Read deployment.yaml and identify replicas, selector and container spec.',         'Trace selector to template labels.',                   'beginner',     20, 'k8s-terminal', 1),
  ('k8s-deployments-services','k8s-expose-service',        'Expose a Deployment with a Service','Use kubectl expose to publish the Deployment behind a Service.',         'Reach the app via cluster DNS.',                       'intermediate', 25, 'k8s-terminal', 2),
  ('k8s-deployments-services','k8s-rolling-update',        'Perform a rolling update',  'Roll out a new image version with kubectl set image and watch the rollout finish.',         'Complete a zero-downtime rollout.',                    'intermediate', 25, 'k8s-terminal', 3),

  -- M5: Monitoring & Troubleshooting + Capstone
  ('k8s-monitoring-troubleshooting','k8s-inspect-cluster','Inspect cluster health',     'Read pod status, events and resource usage to assess cluster health.',                    'Use get events and top to find issues.',               'beginner',     20, 'k8s-terminal', 1),
  ('k8s-monitoring-troubleshooting','k8s-debug-crashloop','Debug a failing Pod',         'Triage a Pod showing repeated restarts using describe and logs.',                         'Identify root cause from logs/events.',                'intermediate', 30, 'k8s-terminal', 2),
  ('k8s-monitoring-troubleshooting','k8s-capstone-deploy','Capstone: build, push, deploy','End-to-end: build an image, push it, deploy 3 replicas and expose it.',                 'Ship a containerised app to Kubernetes.',              'intermediate', 45, 'k8s-terminal', 3)
) AS v(module_slug, slug, title, scenario, objective, difficulty, duration_min, simulator, sort_order)
JOIN m ON m.slug = v.module_slug
ON CONFLICT (slug) DO NOTHING;

-- ---------- Steps (3 per lab) ----------

-- M1.1
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-docker-install-tour')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Confirm Docker CLI works',  'Run docker --help to confirm the docker CLI is installed and on your PATH.',          'docker --help',                  '{"type":"command","contains":"docker"}'::jsonb, 10),
  (2, 'Check Docker version',      'Print the Docker client and engine version with docker version.',                     'docker version',                 '{"type":"command","contains":"docker version"}'::jsonb, 10),
  (3, 'List running containers',   'List currently running containers on this host with docker ps.',                       'docker ps',                      '{"type":"command","contains":"docker ps"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M1.2
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-pull-run-inspect')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Pull the nginx image',         'Pull the official nginx image from Docker Hub: docker pull nginx:latest.',                            'docker pull nginx:latest',                  '{"type":"command","contains":"docker pull"}'::jsonb, 10),
  (2, 'Run nginx in detached mode',   'Start nginx in the background with docker run -d --name web nginx:latest.',                            'docker run -d --name web nginx:latest',     '{"type":"command","contains":"docker run -d"}'::jsonb, 10),
  (3, 'Inspect the running container','Use docker inspect web to print the container metadata as JSON.',                                       'docker inspect web',                        '{"type":"command","contains":"docker inspect"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M1.3
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-container-lifecycle')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'List all containers (incl. stopped)', 'Show every container, running or not, with docker ps -a.',  'docker ps -a',     '{"type":"command","contains":"docker ps -a"}'::jsonb, 10),
  (2, 'Stop a running container',            'Stop the web container gracefully with docker stop web.',  'docker stop web',  '{"type":"command","contains":"docker stop"}'::jsonb, 10),
  (3, 'Remove the stopped container',        'Once stopped, delete it with docker rm web.',              'docker rm web',    '{"type":"command","contains":"docker rm"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M2.1
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-write-dockerfile')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'List lab files',     'Run ls to see the files provided in this lab directory.',                  'ls',                  '{"type":"command","contains":"ls"}'::jsonb, 10),
  (2, 'Read the Dockerfile','Print the Dockerfile to the terminal with cat Dockerfile.',                'cat Dockerfile',      '{"type":"command","contains":"cat Dockerfile"}'::jsonb, 10),
  (3, 'Inspect requirements','Look at the Python deps with cat requirements.txt to see what RUN installs.','cat requirements.txt','{"type":"command","contains":"cat "}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M2.2
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-build-tag-image')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Build the image',          'Build the image from the local Dockerfile and tag it: docker build -t shadowx/app:1.0 .',  'docker build -t shadowx/app:1.0 .',          '{"type":"command","contains":"docker build"}'::jsonb, 10),
  (2, 'List local images',        'Confirm your image exists with docker images.',                                              'docker images',                              '{"type":"command","contains":"docker images"}'::jsonb, 10),
  (3, 'Add a latest tag',         'Tag the same image as latest: docker tag shadowx/app:1.0 shadowx/app:latest.',               'docker tag shadowx/app:1.0 shadowx/app:latest','{"type":"command","contains":"docker tag"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M2.3
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-push-to-registry')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Log in to the registry', 'Authenticate to Docker Hub before pushing: docker login.',                              'docker login',                       '{"type":"command","contains":"docker login"}'::jsonb, 10),
  (2, 'Push the tagged image',  'Push your image to the registry: docker push shadowx/app:1.0.',                         'docker push shadowx/app:1.0',        '{"type":"command","contains":"docker push"}'::jsonb, 10),
  (3, 'Verify with images list','Confirm the local cache still shows the image with docker images.',                     'docker images',                      '{"type":"command","contains":"docker images"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M3.1
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-cluster-tour')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Print cluster info',   'Run kubectl cluster-info to see control plane and CoreDNS endpoints.',          'kubectl cluster-info', '{"type":"command","contains":"cluster-info"}'::jsonb, 10),
  (2, 'List worker nodes',    'List the nodes that make up the cluster: kubectl get nodes.',                   'kubectl get nodes',    '{"type":"command","contains":"get nodes"}'::jsonb, 10),
  (3, 'List namespaces',      'See the default namespaces with kubectl get ns.',                               'kubectl get ns',       '{"type":"command","contains":"get ns"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M3.2
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-deploy-first-pod')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Read the manifest',     'Read deployment.yaml first so you know what you are about to apply: cat deployment.yaml.', 'cat deployment.yaml',                       '{"type":"command","contains":"cat deployment.yaml"}'::jsonb, 10),
  (2, 'Apply the Deployment',  'Create the Deployment with kubectl apply -f deployment.yaml.',                              'kubectl apply -f deployment.yaml',          '{"type":"command","contains":"kubectl apply"}'::jsonb, 10),
  (3, 'List the running pods', 'Confirm three pods are Running with kubectl get pods.',                                     'kubectl get pods',                          '{"type":"command","contains":"get pods"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M3.3
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-scale-replicas')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Check current Deployment','Look at the Deployment summary first: kubectl get deploy.',                                    'kubectl get deploy', '{"type":"command","contains":"get deploy"}'::jsonb, 10),
  (2, 'Scale up to 5 replicas',  'Use kubectl scale deploy/shadowx-app --replicas=5 to increase capacity.',                       'kubectl scale deploy/shadowx-app --replicas=5', '{"type":"command","contains":"kubectl scale"}'::jsonb, 10),
  (3, 'Verify pods are Running', 'Run kubectl get pods to confirm 5 pods are now Running.',                                       'kubectl get pods',   '{"type":"command","contains":"get pods"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M4.1
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-author-deployment-yaml')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Read the Deployment YAML','Open the manifest with cat deployment.yaml and trace replicas, selector and template.',       'cat deployment.yaml',           '{"type":"command","contains":"cat deployment.yaml"}'::jsonb, 10),
  (2, 'Read the Service YAML',   'Open the matching Service file with cat service.yaml.',                                         'cat service.yaml',              '{"type":"command","contains":"cat service.yaml"}'::jsonb, 10),
  (3, 'Describe the Deployment', 'Apply both files then run kubectl describe deploy shadowx-app to see the merged spec.',         'kubectl describe deploy shadowx-app', '{"type":"command","contains":"describe deploy"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M4.2
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-expose-service')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Expose the Deployment',     'Publish the Deployment behind a Service: kubectl expose deploy/shadowx-app --type=LoadBalancer --port=80 --target-port=8080.', 'kubectl expose deploy/shadowx-app --type=LoadBalancer --port=80 --target-port=8080', '{"type":"command","contains":"kubectl expose"}'::jsonb, 10),
  (2, 'List Services',             'Confirm the Service exists with kubectl get svc.',                                            'kubectl get svc',     '{"type":"command","contains":"get svc"}'::jsonb, 10),
  (3, 'Port-forward to test',      'Reach it locally with kubectl port-forward svc/shadowx-app 8080:80.',                          'kubectl port-forward svc/shadowx-app 8080:80', '{"type":"command","contains":"port-forward"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M4.3
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-rolling-update')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Apply updated manifest', 'Re-apply the manifest with the new image tag: kubectl apply -f deployment.yaml.',                  'kubectl apply -f deployment.yaml',          '{"type":"command","contains":"kubectl apply"}'::jsonb, 10),
  (2, 'Watch the rollout',      'Track the rollout with kubectl rollout status deploy/shadowx-app.',                                 'kubectl rollout status deploy/shadowx-app', '{"type":"command","contains":"kubectl rollout"}'::jsonb, 10),
  (3, 'Inspect the new pods',   'Confirm new pods are Running with kubectl get pods.',                                                'kubectl get pods',                          '{"type":"command","contains":"get pods"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M5.1
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-inspect-cluster')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Read recent cluster events','Print recent cluster events with kubectl get events.',           'kubectl get events',  '{"type":"command","contains":"get events"}'::jsonb, 10),
  (2, 'Check pod resource usage',  'Sample CPU and memory per pod with kubectl top pods.',           'kubectl top pods',    '{"type":"command","contains":"kubectl top"}'::jsonb, 10),
  (3, 'List all workloads',        'Get a one-shot overview with kubectl get all.',                  'kubectl get all',     '{"type":"command","contains":"get all"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M5.2
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-debug-crashloop')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Find the failing pod',  'Identify the pod that is restarting with kubectl get pods.',                                    'kubectl get pods',                              '{"type":"command","contains":"get pods"}'::jsonb, 10),
  (2, 'Describe the pod',      'Read the events on the failing pod with kubectl describe pod shadowx-app-xxx.',                 'kubectl describe pod shadowx-app-xxx',          '{"type":"command","contains":"describe pod"}'::jsonb, 10),
  (3, 'Read pod logs',         'Read application logs with kubectl logs shadowx-app-xxx to find the underlying error.',         'kubectl logs shadowx-app-xxx',                  '{"type":"command","contains":"kubectl logs"}'::jsonb, 10)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;

-- M5.3 (capstone)
WITH s AS (SELECT id AS lab_id FROM public.labs WHERE slug='k8s-capstone-deploy')
INSERT INTO public.lab_steps (lab_id, step_number, title, instructions, hint, expected_action, points)
SELECT s.lab_id, x.* FROM s, (VALUES
  (1, 'Build the application image','Build the image from your Dockerfile: docker build -t shadowx/app:1.0 .',                        'docker build -t shadowx/app:1.0 .',         '{"type":"command","contains":"docker build"}'::jsonb, 15),
  (2, 'Push the image',             'Push it to the registry so the cluster can pull it: docker push shadowx/app:1.0.',               'docker push shadowx/app:1.0',               '{"type":"command","contains":"docker push"}'::jsonb, 15),
  (3, 'Deploy and expose to K8s',   'Apply the manifests with kubectl apply -f deployment.yaml then expose the Deployment.',          'kubectl apply -f deployment.yaml',          '{"type":"command","contains":"kubectl apply"}'::jsonb, 20)
) AS x(step_number, title, instructions, hint, expected_action, points)
ON CONFLICT DO NOTHING;
